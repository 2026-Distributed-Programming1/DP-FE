import { useState, useEffect, useCallback } from 'react';
import { fetchChannelRecruitments, createChannelRecruitment } from '../../api/channelRecruitments';

function NewModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ managerName: '', channelType: 'DESIGNER', recruitCount: '', startDate: '', endDate: '', condition: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createChannelRecruitment({ ...form, recruitCount: Number(form.recruitCount) });
      onCreated();
    } catch { setError('등록에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">신규 모집 등록</h3>
          <button onClick={onClose} className="btn-ghost p-1"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-semibold text-on-surface-variant">담당자명 *</label>
            <input className="input text-sm" value={form.managerName} onChange={set('managerName')} required />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-semibold text-on-surface-variant">채널 유형</label>
            <select className="input text-sm" value={form.channelType} onChange={set('channelType')}>
              <option value="DESIGNER">설계사</option>
              <option value="AGENCY">대리점</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">모집 인원 *</label>
            <input type="number" min="1" className="input text-sm" value={form.recruitCount} onChange={set('recruitCount')} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">모집 조건</label>
            <input className="input text-sm" placeholder="예: 생명보험 자격 보유" value={form.condition} onChange={set('condition')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">시작일 *</label>
            <input type="date" className="input text-sm" value={form.startDate} onChange={set('startDate')} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">종료일 *</label>
            <input type="date" className="input text-sm" value={form.endDate} onChange={set('endDate')} required />
          </div>
          {error && <p className="col-span-2 text-xs text-error">{error}</p>}
          <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
        </form>
      </div>
    </div>
  );
}

export default function ChannelRecruitmentPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchChannelRecruitments({ page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">채널 모집</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add</span>신규 모집 등록
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">group_add</span>
          <p className="text-sm">모집 공고가 없습니다.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                {['모집번호', '담당자', '채널 유형', '모집 인원', '기간', '조건', '상태'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.recruitmentNo} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{item.recruitmentNo}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{item.managerName}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{item.channelType === 'DESIGNER' ? '설계사' : '대리점'}</td>
                  <td className="px-4 py-3">{item.recruitCount}명</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{item.startDate}~{item.endDate}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{item.condition || '—'}</td>
                  <td className="px-4 py-3"><span className="badge bg-primary-container/20 text-primary text-[11px]">{item.status}</span></td>
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
