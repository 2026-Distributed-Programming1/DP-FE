import { useState, useEffect, useCallback } from 'react';
import { fetchClaims, CLAIM_STATUS_LABEL, CLAIM_TYPE_LABEL } from '../../api/claims';
import {
  createInvestigation, fetchInvestigation,
  createCalculation, fetchCalculation,
  approveCalculation,
  createClaimPayment, fetchClaimPayment,
  executeClaimPayment,
} from '../../api/claimPayments';

function fmt(n) { return n != null ? `${Number(n).toLocaleString('ko-KR')}원` : '—'; }
function formatDate(iso) { return iso ? new Date(iso).toLocaleDateString('ko-KR') : '—'; }

// ── 단계 표시기 ──────────────────────────────────────────────────
const STEPS = ['접수', '조사', '산출', '승인', '지급'];
function StepBar({ status }) {
  const idx = { RECEIVED: 0, INVESTIGATED: 1, CALCULATED: 2, APPROVED: 3, PAID: 4, CLOSED: 4 }[status] ?? 0;
  return (
    <div className="flex items-center gap-1 mb-4">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 ${i <= idx ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}>
            {i < idx ? <span className="material-symbols-outlined text-[14px]">check</span> : i + 1}
          </div>
          <span className={`text-[11px] ${i === idx ? 'text-primary font-semibold' : 'text-outline'}`}>{s}</span>
          {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < idx ? 'bg-primary' : 'bg-outline-variant'}`} />}
        </div>
      ))}
    </div>
  );
}

// ── 상세 패널 ────────────────────────────────────────────────────
function DetailPanel({ claim, onUpdate }) {
  const [investigation, setInvestigation] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionStep, setActionStep] = useState(null); // 'investigate' | 'execute'
  const [form, setForm] = useState({});
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadDetail = useCallback(async () => {
    if (!claim) return;
    setLoading(true);
    setError('');
    try {
      // 조사 로드
      if (['INVESTIGATED','CALCULATED','APPROVED','PAID','CLOSED'].includes(claim.status)) {
        const inv = await fetchInvestigation(claim.claimNo);
        setInvestigation(inv);
        // 산출 로드
        if (inv?.investigationNo && ['CALCULATED','APPROVED','PAID','CLOSED'].includes(claim.status)) {
          const calc = await fetchCalculation(inv.investigationNo);
          setCalculation(calc);
          // 지급 로드
          if (calc?.calculationNo && ['PAID'].includes(claim.status)) {
            const pay = await fetchClaimPayment(calc.calculationNo);
            setPayment(pay);
          }
        }
      }
    } catch { /* 일부 단계 없을 수 있음 */ } finally {
      setLoading(false);
    }
  }, [claim]);

  useEffect(() => { setInvestigation(null); setCalculation(null); setPayment(null); setActionStep(null); loadDetail(); }, [loadDetail]);

  if (!claim) return (
    <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
      <span className="material-symbols-outlined text-4xl text-outline">health_and_safety</span>
      <p className="text-sm">청구 건을 선택하면 처리 단계가 표시됩니다.</p>
    </div>
  );

  const handleInvestigate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createInvestigation(claim.claimNo, { ...form, result: form.result ?? 'APPROVED', rejectReason: null });
      setActionStep(null);
      onUpdate();
    } catch { setError('조사 등록에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  const handleCalculate = async () => {
    setSubmitting(true);
    try { await createCalculation(investigation.investigationNo); onUpdate(); }
    catch { setError('산출에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try { await approveCalculation(calculation.calculationNo); onUpdate(); }
    catch { setError('승인에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  const handleCreatePayment = async () => {
    setSubmitting(true);
    try { await createClaimPayment(calculation.calculationNo, { paymentType: 'IMMEDIATE', scheduledAt: null }); onUpdate(); }
    catch { setError('지급 생성에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  const handleExecute = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await executeClaimPayment(payment.paymentNo, otp);
      if (result.status === 'COMPLETED') { setActionStep(null); onUpdate(); }
      else setError(`OTP 실패 (${result.otpFailCount ?? ''}회). 다시 시도하세요.`);
    } catch { setError('지급 실행에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  const st = CLAIM_STATUS_LABEL[claim.status] ?? { label: claim.status, cls: 'bg-surface-container text-outline' };

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low">
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge ${st.cls}`}>{st.label}</span>
          <span className="badge bg-surface-container text-on-surface-variant text-[11px]">{CLAIM_TYPE_LABEL[claim.claimType]}</span>
        </div>
        <h3 className="font-bold text-on-surface">{claim.customerName}</h3>
        <p className="text-xs text-outline">{claim.claimNo} · {claim.contractNo}</p>
      </div>

      <div className="p-5">
        <StepBar status={claim.status} />

        {loading && <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}

        {error && <p className="text-xs text-error mb-3">{error}</p>}

        {/* 조사 결과 */}
        {investigation && (
          <div className="mb-4 space-y-1.5 text-sm">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">조사 결과</p>
            <div className="flex justify-between"><span className="text-on-surface-variant">담당자</span><span>{investigation.handlerName}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">인정 손해액</span><span className="font-medium">{fmt(investigation.recognizedDamage)}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">과실 비율</span><span>{investigation.ourFaultRatio}%</span></div>
          </div>
        )}

        {/* 산출 결과 */}
        {calculation && (
          <div className="mb-4 p-3 bg-primary/5 rounded-lg space-y-1.5 text-sm">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">산출 결과</p>
            <div className="flex justify-between"><span className="text-on-surface-variant">최종 지급액</span><span className="font-bold text-primary text-base">{fmt(calculation.finalAmount)}</span></div>
          </div>
        )}

        {/* 지급 정보 */}
        {payment && (
          <div className="mb-4 space-y-1.5 text-sm">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">지급 정보</p>
            <div className="flex justify-between"><span className="text-on-surface-variant">지급 유형</span><span>{payment.paymentType === 'IMMEDIATE' ? '즉시' : '예약'}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">상태</span>
              <span className={payment.status === 'COMPLETED' ? 'text-primary font-semibold' : 'text-error'}>{payment.status}</span>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        {!loading && (
          <div className="space-y-3">
            {/* 조사 등록 */}
            {claim.status === 'RECEIVED' && !investigation && (
              actionStep === 'investigate' ? (
                <form onSubmit={handleInvestigate} className="space-y-2">
                  <input className="input text-sm" placeholder="담당자명" value={form.handlerName ?? ''} onChange={e => setForm(f => ({ ...f, handlerName: e.target.value }))} required />
                  <input type="number" className="input text-sm" placeholder="인정 손해액" value={form.recognizedDamage ?? ''} onChange={e => setForm(f => ({ ...f, recognizedDamage: Number(e.target.value) }))} required />
                  <div className="flex gap-2">
                    <input type="number" className="input text-sm flex-1" placeholder="과실 비율(%)" value={form.ourFaultRatio ?? ''} onChange={e => setForm(f => ({ ...f, ourFaultRatio: Number(e.target.value) }))} required />
                    <input type="number" className="input text-sm flex-1" placeholder="상대 과실(%)" value={form.counterFaultRatio ?? ''} onChange={e => setForm(f => ({ ...f, counterFaultRatio: Number(e.target.value) }))} required />
                  </div>
                  <textarea className="input resize-none text-sm" rows={2} placeholder="의견" value={form.opinion ?? ''} onChange={e => setForm(f => ({ ...f, opinion: e.target.value }))} />
                  <div className="flex gap-2">
                    <button type="button" className="btn-ghost flex-1" onClick={() => setActionStep(null)}>취소</button>
                    <button type="submit" className="btn-primary flex-1" disabled={submitting}>등록</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setActionStep('investigate')} className="btn-primary w-full">손해 조사 등록</button>
              )
            )}

            {/* 산출 */}
            {claim.status === 'INVESTIGATED' && investigation?.result === 'APPROVED' && !calculation && (
              <button onClick={handleCalculate} disabled={submitting} className="btn-primary w-full">보험금 산출</button>
            )}

            {/* 승인 */}
            {calculation?.status === 'CALCULATED' && (
              <button onClick={handleApprove} disabled={submitting} className="btn-primary w-full">산출 승인</button>
            )}

            {/* 지급 생성 */}
            {calculation?.status === 'APPROVED' && !payment && (
              <button onClick={handleCreatePayment} disabled={submitting} className="btn-primary w-full">지급 생성</button>
            )}

            {/* 지급 실행 */}
            {payment?.status === 'WAITING' && (
              actionStep === 'execute' ? (
                <form onSubmit={handleExecute} className="space-y-2">
                  <input className="input text-sm text-center tracking-widest" placeholder="OTP 6자리" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required />
                  <div className="flex gap-2">
                    <button type="button" className="btn-ghost flex-1" onClick={() => setActionStep(null)}>취소</button>
                    <button type="submit" className="btn-primary flex-1" disabled={submitting}>지급 실행</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setActionStep('execute')} className="btn-primary w-full">지급 실행</button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
export default function ClaimPaymentPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClaims({ page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">보험금 지급</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">조사 → 산출 → 승인 → 지급 단계를 처리합니다.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">health_and_safety</span>
              <p className="text-sm">처리할 청구 건이 없습니다.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                    {['고객명', '유형', '청구일', '상태'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const st = CLAIM_STATUS_LABEL[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };
                    return (
                      <tr key={item.claimNo} onClick={() => setSelectedClaim(item)}
                        className={`border-b border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors
                          ${selectedClaim?.claimNo === item.claimNo ? 'bg-primary/5' : ''}`}>
                        <td className="px-4 py-3 font-medium text-on-surface">{item.customerName}</td>
                        <td className="px-4 py-3"><span className="badge bg-surface-container text-on-surface-variant text-[11px]">{CLAIM_TYPE_LABEL[item.claimType]}</span></td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">{formatDate(item.requestedAt)}</td>
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
        <div className="lg:col-span-6 lg:sticky lg:top-24 self-start">
          <DetailPanel claim={selectedClaim} onUpdate={() => { load(); setSelectedClaim(null); }} />
        </div>
      </div>
    </div>
  );
}
