import { useState, useEffect, useCallback } from 'react';
import { fetchClaims, fetchClaim, CLAIM_STATUS_LABEL, CLAIM_TYPE_LABEL } from '../../api/claims';

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('ko-KR') : '—';
}

/* ══════════════════════════════════
   메인 페이지
══════════════════════════════════ */
export default function ClaimListPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClaims({ page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    setDetailLoading(true);
    fetchClaim(selected)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [selected]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">청구 목록</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">receipt_long</span>
              <p className="text-sm">청구 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                    {['청구번호', '고객명', '계약번호', '유형', '접수일', '상태'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const st = CLAIM_STATUS_LABEL[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };
                    return (
                      <tr key={item.claimNo} onClick={() => setSelected(item.claimNo)}
                        className={`border-b border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors ${selected === item.claimNo ? 'bg-primary/5' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-primary">{item.claimNo}</td>
                        <td className="px-4 py-3 font-medium text-on-surface">{item.customerName}</td>
                        <td className="px-4 py-3 text-on-surface-variant text-xs">{item.contractNo}</td>
                        <td className="px-4 py-3"><span className="badge bg-surface-container text-on-surface-variant text-[11px]">{CLAIM_TYPE_LABEL[item.claimType] ?? item.claimType}</span></td>
                        <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(item.requestedAt)}</td>
                        <td className="px-4 py-3"><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          )}
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          {detailLoading ? (
            <div className="card h-40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : detail ? (
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low">
                <span className={`badge ${(CLAIM_STATUS_LABEL[detail.status] ?? { cls: 'bg-surface-container text-outline' }).cls}`}>{(CLAIM_STATUS_LABEL[detail.status] ?? { label: detail.status }).label}</span>
                <h3 className="font-bold text-on-surface mt-1">{detail.customerName}</h3>
                <p className="text-xs text-outline">{detail.claimNo}</p>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: '계약번호', value: detail.contractNo },
                  { label: '청구 유형', value: CLAIM_TYPE_LABEL[detail.claimType] ?? detail.claimType },
                  { label: '접수일', value: formatDate(detail.requestedAt) },
                  { label: '은행', value: detail.bankName },
                  { label: '계좌번호', value: detail.accountNo },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">{label}</span>
                    <span className="font-medium text-on-surface">{value ?? '—'}</span>
                  </div>
                ))}
                {detail.claimReasons?.length > 0 && (
                  <div className="pt-2 border-t border-outline-variant/30">
                    <p className="text-xs text-on-surface-variant mb-1">청구 사유</p>
                    <p className="text-sm text-on-surface">{detail.claimReasons.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
              <span className="material-symbols-outlined text-4xl text-outline">receipt_long</span>
              <p className="text-sm">청구를 선택하면 상세 정보가 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
