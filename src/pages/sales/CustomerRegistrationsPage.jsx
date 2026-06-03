import { useState, useEffect, useCallback } from 'react';
import { fetchCustomerRegistrations, createCustomerRegistration } from '../../api/salesExtras';

function NewModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', ssn: '', phone: '', address: '', insuranceType: '', contractDate: '', expiryDate: '', monthlyPremium: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await createCustomerRegistration({ ...form, monthlyPremium: Number(form.monthlyPremium) }); onCreated(); }
    catch { setError('등록에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">고객 정보 등록</h3>
          <button onClick={onClose} className="btn-ghost p-1"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          {[['이름', 'name', 'text', 'col-span-2'], ['주민등록번호', 'ssn', 'text', 'col-span-2'], ['연락처', 'phone', 'text', ''], ['보험 종류', 'insuranceType', 'text', ''], ['주소', 'address', 'text', 'col-span-2'], ['계약일', 'contractDate', 'date', ''], ['만기일', 'expiryDate', 'date', ''], ['월 보험료', 'monthlyPremium', 'number', '']].map(([label, k, type, span]) => (
            <div key={k} className={`space-y-1.5 ${span}`}>
              <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
              <input type={type} className="input text-sm" value={form[k]} onChange={set(k)} required />
            </div>
          ))}
          {error && <p className="col-span-2 text-xs text-error">{error}</p>}
          <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
        </form>
      </div>
    </div>
  );
}

export default function CustomerRegistrationsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await fetchCustomerRegistrations({ page, size: 20 }); setItems(d.items ?? []); setTotal(d.total ?? 0); }
    catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-on-surface">고객 정보 등록</h1><p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p></div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">add</span>등록</button>
      </div>
      {loading ? <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      : items.length === 0 ? <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant"><span className="material-symbols-outlined text-4xl text-outline">person_add</span><p className="text-sm">등록된 고객이 없습니다.</p></div>
      : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-outline-variant/50 bg-surface-container-low">{['이름','주민번호','연락처','보험종류','계약일','월 보험료'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>)}</tr></thead>
            <tbody>
              {items.map((item, i)=>(
                <tr key={i} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-medium text-on-surface">{item.name}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant font-mono">{item.maskedSsn}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{item.phone}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{item.insuranceType}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{item.contractDate}</td>
                  <td className="px-4 py-3">{item.monthlyPremium?.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && <div className="flex items-center justify-center gap-1"><button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>{Array.from({length:totalPages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p===page?'bg-primary text-on-primary':'text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>)}<button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button></div>}
      {showNew && <NewModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} />}
    </div>
  );
}
