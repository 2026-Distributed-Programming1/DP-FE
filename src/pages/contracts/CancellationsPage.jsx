import { useState, useEffect, useCallback } from 'react';
import { fetchCancellations } from '../../api/contractExtras';
import { createRefundCalculation } from '../../api/financeExtras';

export default function CancellationsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchCancellations({ page, size: 20 });
      setItems(d.items ?? []);
      setTotal(d.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const handleRefund = async (cancellationNo) => {
    setCalculating(cancellationNo);
    setError('');
    try { await createRefundCalculation(cancellationNo); load(); }
    catch (err) { setError(err.message || '환급 산출에 실패했습니다.'); }
    finally { setCalculating(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">해지 관리</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">cancel</span>
          <p className="text-sm">해지 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                {['해지번호', '계약번호', '해지일', '사유', '상태', '환급'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.cancellationNo} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{item.cancellationNo}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{item.contractNo}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{item.cancellationDate}</td>
                  <td className="px-4 py-3 text-on-surface-variant truncate max-w-[120px]">{item.reason}</td>
                  <td className="px-4 py-3"><span className="badge bg-surface-container text-on-surface-variant text-[11px]">{item.status}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleRefund(item.cancellationNo)} disabled={calculating === item.cancellationNo}
                      className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-full text-xs font-semibold transition-colors disabled:opacity-50">
                      {calculating === item.cancellationNo ? '산출 중...' : '환급 산출'}
                    </button>
                  </td>
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
    </div>
  );
}
