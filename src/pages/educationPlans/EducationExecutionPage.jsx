import { useState, useEffect, useCallback } from 'react';
import { fetchEducationExecutions, createEducationExecution, fetchEducationPreparations } from '../../api/educationPreparations';

function NewModal({ onClose, onCreated }) {
  const [preps, setPreps] = useState([]);
  const [form, setForm] = useState({ prepNo: '', trainerName: '', memo: '' });
  const [attendees, setAttendees] = useState([{ attendeeName: '', attended: true }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEducationPreparations({ size: 100 })
      .then(d => setPreps(d.items ?? []))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createEducationExecution({ ...form, attendances: attendees.filter(a => a.attendeeName) });
      onCreated();
    } catch { setError('등록에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">교육 실행 등록</h3>
          <button onClick={onClose} className="btn-ghost p-1"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">교육 제반 *</label>
            <select className="input text-sm" value={form.prepNo} onChange={set('prepNo')} required>
              <option value="">선택하세요</option>
              {preps.map(p => <option key={p.prepNo} value={p.prepNo}>{p.planNo} - {p.venue} ({p.prepNo})</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">강사명 *</label>
            <input className="input text-sm" value={form.trainerName} onChange={set('trainerName')} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">출석 현황</label>
            {attendees.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className="input text-sm flex-1" placeholder="이름" value={a.attendeeName}
                  onChange={e => setAttendees(arr => arr.map((x, j) => j === i ? { ...x, attendeeName: e.target.value } : x))} />
                <label className="flex items-center gap-1 text-sm shrink-0">
                  <input type="checkbox" className="accent-primary" checked={a.attended}
                    onChange={e => setAttendees(arr => arr.map((x, j) => j === i ? { ...x, attended: e.target.checked } : x))} />
                  출석
                </label>
              </div>
            ))}
            <button type="button" className="btn-ghost text-xs" onClick={() => setAttendees(arr => [...arr, { attendeeName: '', attended: true }])}>+ 추가</button>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">메모</label>
            <textarea className="input resize-none text-sm" rows={2} value={form.memo} onChange={set('memo')} />
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>취소</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>{submitting ? '등록 중...' : '실행 완료 등록'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EducationExecutionPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchEducationExecutions({ page, size: 20 });
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
          <h1 className="text-xl font-bold text-on-surface">교육 실행</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add</span>실행 등록
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">play_circle</span>
          <p className="text-sm">등록된 교육 실행이 없습니다.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                {['실행번호', '강사', '실행일시', '출석/전체', '상태'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.executionNo} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{item.executionNo}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{item.trainerName}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">
                    {item.executedAt ? new Date(item.executedAt).toLocaleDateString('ko-KR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{item.attendeeCount}/{item.totalCount}</td>
                  <td className="px-4 py-3"><span className="badge bg-primary-container/20 text-primary text-[11px]">{item.status ?? '완료'}</span></td>
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
