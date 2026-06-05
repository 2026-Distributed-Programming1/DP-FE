import { useState, useEffect, useCallback } from 'react';
import {
  fetchRefundCalculations, confirmRefundCalculation,
  fetchRefundPayments, executeRefundPayment,
} from '../../api/financeExtras';

function fmt(n) { return n != null ? `${Number(n).toLocaleString('ko-KR')}원` : '—'; }

const CALC_STATUS = {
  CALCULATED: { label: '산출완료', cls: 'bg-primary-container/20 text-primary' },
  PAID:       { label: '지급완료', cls: 'bg-surface-container text-outline' },
  CONFIRMED:  { label: '확정',     cls: 'bg-secondary-container text-on-secondary-container' },
};
const PAY_STATUS = {
  WAITING:   { label: '대기',   cls: 'bg-error-container/30 text-error' },
  COMPLETED: { label: '완료',   cls: 'bg-primary-container/20 text-primary' },
  FAILED:    { label: '실패',   cls: 'bg-error-container text-on-error-container' },
  LOCKED:    { label: '잠김',   cls: 'bg-surface-container text-outline' },
};

export default function RefundsPage() {
  const [tab, setTab] = useState('calc'); // 'calc' | 'pay'
  const [calcItems, setCalcItems] = useState([]);
  const [payItems, setPayItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [selectedPayNo, setSelectedPayNo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'calc') {
        const d = await fetchRefundCalculations({ page, size: 20 });
        setCalcItems(d.items ?? []);
        setTotal(d.total ?? 0);
      } else {
        const d = await fetchRefundPayments({ page, size: 20 });
        setPayItems(d.items ?? []);
        setTotal(d.total ?? 0);
      }
    } catch { } finally { setLoading(false); }
  }, [tab, page]);

  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { load(); }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const handleConfirm = async (refundNo) => {
    if (!confirm('지급 이관하시겠습니까?')) return;
    setSubmitting(true);
    try { await confirmRefundCalculation(refundNo); load(); }
    catch { setError('확정에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  const handleExecute = async (paymentNo) => {
    if (!otp || otp.length !== 6) { setError('OTP 6자리를 입력하세요.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const r = await executeRefundPayment(paymentNo, otp);
      if (r.status === 'COMPLETED') { setSelectedPayNo(null); setOtp(''); load(); }
      else setError(`OTP 실패 (${r.otpFailCount ?? ''}회). 다시 시도하세요.`);
    } catch { setError('지급 실행에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  const pagination = totalPages > 1 ? (
    <div className="flex items-center justify-center gap-1">
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
      ))}
      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">해지·환급 관리</h1>
      </div>
      <div className="flex gap-1 border-b border-outline-variant/50 pb-0">
        {[{ v: 'calc', l: '환급 산출' }, { v: 'pay', l: '환급 지급' }].map(({ v, l }) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === v ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === 'calc' ? (
        <div className="space-y-4">
          {calcItems.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">currency_exchange</span>
              <p className="text-sm">환급 산출 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                    {['산출번호', '해지번호', '최종 환급액', '상태', '액션'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calcItems.map(item => {
                    const st = CALC_STATUS[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };
                    return (
                      <tr key={item.refundNo} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                        <td className="px-4 py-3 font-mono text-xs text-primary">{item.refundNo}</td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">{item.cancellationNo}</td>
                        <td className="px-4 py-3 font-bold text-primary">{fmt(item.finalRefund)}</td>
                        <td className="px-4 py-3"><span className={`badge ${st.cls}`}>{st.label}</span></td>
                        <td className="px-4 py-3">
                          {item.status === 'CALCULATED' && (
                            <button onClick={() => handleConfirm(item.refundNo)} disabled={submitting}
                              className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-full text-xs font-semibold transition-colors">지급 이관</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
          {pagination}
        </div>
      ) : (
        <div className="space-y-4">
          {payItems.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">payments</span>
              <p className="text-sm">환급 지급 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                    {['지급번호', '산출번호', '상태', 'OTP 실패', '실행'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payItems.map(item => {
                    const st = PAY_STATUS[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };
                    return (
                      <tr key={item.paymentNo} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                        <td className="px-4 py-3 font-mono text-xs text-primary">{item.paymentNo}</td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">{item.refundNo}</td>
                        <td className="px-4 py-3"><span className={`badge ${st.cls}`}>{st.label}</span></td>
                        <td className="px-4 py-3 text-on-surface-variant">{item.otpFailCount ?? 0}회</td>
                        <td className="px-4 py-3">
                          {item.status === 'WAITING' && (
                            selectedPayNo === item.paymentNo ? (
                              <div className="flex items-center gap-2">
                                <input className="input text-sm text-center w-24 tracking-widest" maxLength={6} placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                                <button onClick={() => handleExecute(item.paymentNo)} disabled={submitting} className="px-3 py-1 bg-primary text-on-primary rounded-full text-xs font-semibold">실행</button>
                                <button onClick={() => { setSelectedPayNo(null); setOtp(''); setError(''); }} className="text-outline text-xs">취소</button>
                              </div>
                            ) : (
                              <button onClick={() => { setSelectedPayNo(item.paymentNo); setError(''); }}
                                className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-full text-xs font-semibold transition-colors">OTP 실행</button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
          {pagination}
        </div>
      )}
    </div>
  );
}
