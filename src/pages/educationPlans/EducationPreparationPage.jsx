import { useState, useEffect, useCallback } from 'react';
import { fetchEducationPreparations, createEducationPreparation } from '../../api/educationPreparations';
import { fetchEducationPlans } from '../../api/educationPlans';

function NewModal({ onClose, onCreated }) {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ planNo: '', instructorName: '', venue: '', textbookStatus: '', additionalNotice: '', attendees: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    fetchEducationPlans({ status: 'APPROVED', size: 100 })
      .then(d => setPlans(d.items ?? []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createEducationPreparation({
        ...form,
        attendees: form.attendees.split(',').map(s => s.trim()).filter(Boolean),
      });
      onCreated();
    } catch { setError('등록에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">교육 제반 등록</h3>
          <button onClick={onClose} className="btn-ghost p-1"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">교육 계획 (승인된 것만) *</label>
            <select className="input text-sm" value={form.planNo} onChange={set('planNo')} required>
              <option value="">선택하세요</option>
              {plans.map(p => <option key={p.planNo} value={p.planNo}>{p.educationName} ({p.planNo})</option>)}
            </select>
          </div>
          {[['강사명', 'instructorName', ''], ['교육 장소', 'venue', ''], ['교재 준비 현황', 'textbookStatus', '예: 인쇄 완료'], ['기타 준비 사항', 'additionalNotice', '선택']].map(([label, k, ph]) => (
            <div key={k} className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
              <input className="input text-sm" placeholder={ph} value={form[k]} onChange={set(k)} required={!ph.includes('선택')} />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">대상자 명단 (쉼표 구분)</label>
            <input className="input text-sm" placeholder="홍설계사, 김설계사" value={form.attendees} onChange={set('attendees')} />
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>취소</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EducationPreparationPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchEducationPreparations({ page, size: 20 });
      setItems(d.items ?? []);
      setTotal(d.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">교육 제반</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add</span>등록
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">checklist</span>
          <p className="text-sm">등록된 교육 제반이 없습니다.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                {['제반번호', '계획번호', '강사', '장소', '교재 현황', '상태'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.prepNo} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{item.prepNo}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{item.planNo}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{item.instructorName}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{item.venue}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{item.textbookStatus}</td>
                  <td className="px-4 py-3"><span className="badge bg-primary-container/20 text-primary text-[11px]">{item.status ?? '준비중'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
        </div>
      )}
      {showNew && <NewModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} />}
    </div>
  );
}
