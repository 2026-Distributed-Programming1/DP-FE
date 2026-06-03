import { useState, useEffect, useCallback } from 'react';
import { fetchActivityPlans, createActivityPlan } from '../../api/salesExtras';

const PLAN_STATUS_CLS = {
  TEMP_SAVE:    'bg-surface-container text-outline',
  UNDER_REVIEW: 'bg-error-container/30 text-error',
  APPROVED:     'bg-primary-container/20 text-primary',
  REJECTED:     'bg-error-container text-on-error-container',
};
const PLAN_STATUS_LABEL = { TEMP_SAVE: '임시저장', UNDER_REVIEW: '승인요청', APPROVED: '승인', REJECTED: '반려' };

function NewModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    planName: '', startDate: '', endDate: '', author: '',
    targetContractCount: '', targetContractAmount: '', targetNewCustomer: '',
    proposedInsuranceType: 'CAR', proposalReason: '', status: 'TEMP_SAVE',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createActivityPlan({
        ...form, status,
        targetContractCount: Number(form.targetContractCount),
        targetContractAmount: Number(form.targetContractAmount),
        targetNewCustomer: Number(form.targetNewCustomer),
      });
      onCreated();
    } catch { setError('등록에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">활동 계획 작성</h3>
          <button onClick={onClose} className="btn-ghost p-1"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2"><label className="text-xs font-semibold text-on-surface-variant">계획명 *</label><input className="input text-sm" value={form.planName} onChange={set('planName')} required /></div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-on-surface-variant">작성자</label><input className="input text-sm" value={form.author} onChange={set('author')} /></div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-on-surface-variant">제안 보험종류</label><input className="input text-sm" value={form.proposedInsuranceType} onChange={set('proposedInsuranceType')} /></div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-on-surface-variant">시작일</label><input type="date" className="input text-sm" value={form.startDate} onChange={set('startDate')} /></div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-on-surface-variant">종료일</label><input type="date" className="input text-sm" value={form.endDate} onChange={set('endDate')} /></div>
          {[['목표 계약건수', 'targetContractCount'], ['목표 계약금액', 'targetContractAmount'], ['목표 신규고객', 'targetNewCustomer']].map(([label, k]) => (
            <div key={k} className="space-y-1.5"><label className="text-xs font-semibold text-on-surface-variant">{label}</label><input type="number" className="input text-sm" value={form[k]} onChange={set(k)} /></div>
          ))}
          <div className="space-y-1.5 col-span-2"><label className="text-xs font-semibold text-on-surface-variant">제안 이유</label><textarea className="input resize-none text-sm" rows={2} value={form.proposalReason} onChange={set('proposalReason')} /></div>
          {error && <p className="col-span-2 text-xs text-error">{error}</p>}
          <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
          <button type="button" className="btn-ghost border border-outline-variant" disabled={submitting} onClick={(e) => handleSubmit(e, 'TEMP_SAVE')}>임시저장</button>
          <button type="button" className="btn-primary col-span-2" disabled={submitting} onClick={(e) => handleSubmit(e, 'UNDER_REVIEW')}>승인 요청</button>
        </form>
      </div>
    </div>
  );
}

export default function ActivityPlansPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await fetchActivityPlans({ page, size: 20 }); setItems(d.items ?? []); setTotal(d.total ?? 0); }
    catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-on-surface">활동 계획</h1><p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p></div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">add</span>작성</button>
      </div>
      {loading ? <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      : items.length === 0 ? <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant"><span className="material-symbols-outlined text-4xl text-outline">event_note</span><p className="text-sm">활동 계획이 없습니다.</p></div>
      : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-outline-variant/50 bg-surface-container-low">{['계획명','작성자','기간','계약목표','상태'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>)}</tr></thead>
            <tbody>
              {items.map(item=>{
                const cls = PLAN_STATUS_CLS[item.status] ?? 'bg-surface-container text-outline';
                return (
                  <tr key={item.planNo} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                    <td className="px-4 py-3 font-medium text-on-surface">{item.planName}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{item.author}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{item.startDate}~{item.endDate}</td>
                    <td className="px-4 py-3">{item.targetContractCount?.toLocaleString()}건</td>
                    <td className="px-4 py-3"><span className={`badge ${cls}`}>{PLAN_STATUS_LABEL[item.status] ?? item.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && <div className="flex items-center justify-center gap-1"><button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>{Array.from({length:totalPages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p===page?'bg-primary text-on-primary':'text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>)}<button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button></div>}
      {showNew && <NewModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} />}
    </div>
  );
}
