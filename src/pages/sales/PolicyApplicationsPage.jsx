import { useState, useEffect } from 'react';
import { fetchPolicyApplications, fetchInsuranceApplications, fetchRevivals } from '../../api/salesExtras';

export default function PolicyApplicationsPage() {
  const [tab, setTab] = useState('policy');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fn = tab === 'policy' ? fetchPolicyApplications
             : tab === 'insurance' ? fetchInsuranceApplications
             : fetchRevivals;
    fn({ size: 20 })
      .then(d => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  const TABS = [{ v: 'policy', l: '청약서' }, { v: 'insurance', l: '보험신청' }, { v: 'revival', l: '부활신청' }];

  const COLS = {
    policy:    ['신청번호', '고객명', '상품명', '기간', '납입방법', '상태', '제출일'],
    insurance: ['신청번호', '고객명', '상품명', '납입방법', '상태', '신청일'],
    revival:   ['신청번호', '계약번호', '고객명', '연락처', '미납액', '납입방법', '신청일'],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-on-surface">청약 목록</h1>
      <div className="flex gap-1 border-b border-outline-variant/50">
        {TABS.map(({ v, l }) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === v ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>{l}</button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">article</span>
          <p className="text-sm">내역이 없습니다.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                  {COLS[tab].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                    {tab === 'policy' && <>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{item.applicationNo}</td>
                      <td className="px-4 py-3 font-medium text-on-surface">{item.customerName}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{item.productName}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{item.period}개월</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{item.paymentMethod === 'IMMEDIATE_TRANSFER' ? '즉시이체' : '가상계좌'}</td>
                      <td className="px-4 py-3"><span className="badge bg-surface-container text-on-surface-variant text-[11px]">{item.status}</span></td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{item.submittedAt?.slice(0,10)}</td>
                    </>}
                    {tab === 'insurance' && <>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{item.applicationNo}</td>
                      <td className="px-4 py-3 font-medium text-on-surface">{item.customerName}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{item.productName}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{item.paymentMethod === 'IMMEDIATE_TRANSFER' ? '즉시이체' : '가상계좌'}</td>
                      <td className="px-4 py-3"><span className="badge bg-surface-container text-on-surface-variant text-[11px]">{item.status}</span></td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{item.appliedAt?.slice(0,10)}</td>
                    </>}
                    {tab === 'revival' && <>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{item.revivalNo}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{item.contractNo}</td>
                      <td className="px-4 py-3 font-medium text-on-surface">{item.customerName}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{item.contact}</td>
                      <td className="px-4 py-3 font-medium text-error">{item.unpaidAmount?.toLocaleString()}원</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{item.paymentMethod === 'IMMEDIATE_TRANSFER' ? '즉시이체' : '가상계좌'}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{item.appliedAt?.slice(0,10)}</td>
                    </>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
