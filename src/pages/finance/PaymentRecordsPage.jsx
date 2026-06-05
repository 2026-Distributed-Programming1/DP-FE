import { useState, useEffect, useCallback } from 'react';
import { fetchPaymentRecords, confirmPaymentRecord, rejectPaymentRecord } from '../../api/financeExtras';

const STATUS_STYLE = {
  WAITING:   { label: '대기',   cls: 'bg-error-container/30 text-error' },
  COMPLETED: { label: '확정',   cls: 'bg-primary-container/20 text-primary' },
  REJECTED:  { label: '반려',   cls: 'bg-surface-container text-outline' },
};

const REJECT_CATEGORIES = [
  { value: 'PAYMENT_ERROR', label: '납입 오류' },
  { value: 'DUPLICATE_PAYMENT', label: '중복 납입' },
  { value: 'CONTRACT_MISMATCH', label: '계약 불일치' },
  { value: 'OTHER', label: '기타' },
];

function DetailPanel({ item, onAction }) {
  const [showReject, setShowReject] = useState(false);
  const [rejectForm, setRejectForm] = useState({ rejectCategory: 'OTHER', rejectReason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setShowReject(false); setError(''); }, [item]);

  if (!item) return (
    <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
      <span className="material-symbols-outlined text-4xl text-outline">receipt</span>
      <p className="text-sm">납부 기록을 선택하면 상세가 표시됩니다.</p>
    </div>
  );

  const st = STATUS_STYLE[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };

  const handleConfirm = async () => {
    if (!confirm('확정 처리하시겠습니까?')) return;
    setSubmitting(true);
    try { await confirmPaymentRecord(item.recordNo); onAction(); }
    catch { setError('확정에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await rejectPaymentRecord(item.recordNo, rejectForm); onAction(); }
    catch { setError('반려에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low">
        <span className={`badge ${st.cls}`}>{st.label}</span>
        <h3 className="font-bold text-on-surface mt-1">{item.customerName}</h3>
        <p className="text-xs text-outline">{item.recordNo}</p>
      </div>
      <div className="p-5 border-b border-outline-variant/50 space-y-3">
        {[
          { label: '계약번호',  value: item.contractNo },
          { label: '납기일',    value: item.dueDate },
          { label: '납입액',    value: `${item.amount?.toLocaleString()}원` },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-on-surface-variant">{label}</span>
            <span className="font-medium text-on-surface">{value ?? '—'}</span>
          </div>
        ))}
      </div>
      {item.status === 'WAITING' && (
        <div className="p-5 space-y-3">
          {!showReject ? (
            <div className="flex gap-2">
              <button onClick={handleConfirm} disabled={submitting} className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-sm font-semibold">확정</button>
              <button onClick={() => setShowReject(true)} className="flex-1 bg-error/10 text-error py-2 rounded-lg text-sm font-semibold">반려</button>
            </div>
          ) : (
            <form onSubmit={handleReject} className="space-y-2">
              <select className="input text-sm" value={rejectForm.rejectCategory} onChange={e => setRejectForm(f => ({ ...f, rejectCategory: e.target.value }))}>
                {REJECT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <textarea className="input resize-none text-sm" rows={2} placeholder="반려 사유" value={rejectForm.rejectReason} onChange={e => setRejectForm(f => ({ ...f, rejectReason: e.target.value }))} required />
              <div className="flex gap-2">
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowReject(false)}>취소</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-error text-on-error py-2 rounded-lg text-sm font-semibold">반려 확인</button>
              </div>
            </form>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function PaymentRecordsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchPaymentRecords({ status: statusFilter, page, size: 20 });
      setItems(d.items ?? []);
      setTotal(d.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">납부 내역 관리</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
        </div>
        <div className="flex gap-1">
          {[{ v: '', l: '전체' }, { v: 'WAITING', l: '대기' }, { v: 'COMPLETED', l: '확정' }, { v: 'REJECTED', l: '반려' }].map(({ v, l }) => (
            <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === v ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">receipt</span>
              <p className="text-sm">납부 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                    {['고객명', '계약번호', '납기일', '납입액', '상태'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const st = STATUS_STYLE[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };
                    return (
                      <tr key={item.recordNo} onClick={() => setSelected(item)}
                        className={`border-b border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors ${selected?.recordNo === item.recordNo ? 'bg-primary/5' : ''}`}>
                        <td className="px-4 py-3 font-medium text-on-surface">{item.customerName}</td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">{item.contractNo}</td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">{item.dueDate}</td>
                        <td className="px-4 py-3 font-medium">{item.amount?.toLocaleString()}원</td>
                        <td className="px-4 py-3"><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      </tr>
                    );
                  })}
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
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <DetailPanel item={selected} onAction={() => { setSelected(null); load(); }} />
        </div>
      </div>
    </div>
  );
}
