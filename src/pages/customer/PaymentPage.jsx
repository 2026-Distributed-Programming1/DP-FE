import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCustomerContracts, previewPayment, submitPayment } from '../../api/payments';

function fmt(n) { return n != null ? `${Number(n).toLocaleString('ko-KR')}원` : '0원'; }

const STEPS = ['계약 선택', '납입 확인', '완료'];

export default function PaymentPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [contracts, setContracts] = useState([]);
  const [selected, setSelected] = useState({}); // contractNo → count
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ paymentMethod: 'IMMEDIATE_TRANSFER', bankName: '', accountNo: '', accountHolder: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.linkedCustomerNo) return;
    setLoading(true);
    fetchCustomerContracts(user.linkedCustomerNo)
      .then((data) => setContracts(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const toggleSelect = (contractNo) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[contractNo]) delete next[contractNo];
      else next[contractNo] = 1;
      return next;
    });
  };

  const handlePreview = async () => {
    const items = Object.entries(selected).map(([contractNo, count]) => ({ contractNo, count }));
    if (!items.length) { setError('납입할 계약을 선택하세요.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await previewPayment(items);
      setPreview(data);
      setStep(1);
    } catch { setError('납입 미리보기에 실패했습니다.'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bankName || !form.accountNo || !form.accountHolder) { setError('계좌 정보를 모두 입력하세요.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const items = Object.entries(selected).map(([contractNo, count]) => ({ contractNo, count }));
      const data = await submitPayment({ customerId: user.linkedCustomerNo, items, ...form });
      setResult(data);
      setStep(2);
    } catch { setError('납입 처리에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">보험료 납입</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">납입할 계약을 선택하고 결제 정보를 입력하세요.</p>
      </div>

      {/* 스텝 바 */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i <= step ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}>
              {i < step ? <span className="material-symbols-outlined text-[14px]">check</span> : i + 1}
            </div>
            <span className={`text-xs ${i === step ? 'text-primary font-semibold' : 'text-outline'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary' : 'bg-outline-variant'}`} />}
          </div>
        ))}
      </div>

      {/* 단계별 내용 */}
      {step === 0 && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : contracts.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-12 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">description</span>
              <p className="text-sm">납입 가능한 계약이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map(c => (
                <div key={c.contractNo} onClick={() => toggleSelect(c.contractNo)}
                  className={`card p-4 cursor-pointer transition-all hover:shadow-sm flex items-start gap-3 ${selected[c.contractNo] ? 'ring-2 ring-primary/40 bg-primary/5' : ''}`}>
                  <input type="checkbox" className="accent-primary mt-0.5" checked={!!selected[c.contractNo]} onChange={() => {}} />
                  <div className="flex-1">
                    <p className="font-medium text-on-surface">{c.insuranceType}</p>
                    <p className="text-xs text-on-surface-variant">{c.contractNo}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-semibold text-primary">{fmt(c.monthlyPremium)}</span>
                      {c.unpaidCount > 0 && (
                        <span className="badge bg-error-container text-on-error-container text-[11px]">미납 {c.unpaidCount}회</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
          <button onClick={handlePreview} className="btn-primary w-full py-2.5" disabled={loading || !Object.keys(selected).length}>
            다음 단계
          </button>
        </div>
      )}

      {step === 1 && preview && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 납입 내역 */}
          <div className="card p-5 space-y-3">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">납입 내역</p>
            {preview.items?.map(item => (
              <div key={item.contractNo} className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{item.insuranceType}</span>
                <span className="font-medium">{fmt(item.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-on-surface pt-2 border-t border-outline-variant/50">
              <span>총 납입액</span>
              <span className="text-primary text-lg">{fmt(preview.totalAmount)}</span>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">결제 정보</p>
            <div className="flex gap-2">
              {[{ v: 'IMMEDIATE_TRANSFER', l: '즉시이체' }, { v: 'VIRTUAL_ACCOUNT', l: '가상계좌' }].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => set('paymentMethod')({ target: { value: v } })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${form.paymentMethod === v ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant'}`}>{l}</button>
              ))}
            </div>
            {[['은행명', 'bankName', '국민은행'], ['계좌번호', 'accountNo', '123-456-789'], ['예금주', 'accountHolder', '홍길동']].map(([label, k, ph]) => (
              <div key={k} className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
                <input className="input text-sm" placeholder={ph} value={form[k]} onChange={set(k)} required />
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setStep(0)}>이전</button>
            <button type="submit" className="btn-primary flex-1 py-2.5" disabled={submitting}>{submitting ? '처리 중...' : '납입 완료'}</button>
          </div>
        </form>
      )}

      {step === 2 && result && (
        <div className="card p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
          </div>
          <h3 className="font-bold text-lg text-on-surface">납입 완료</h3>
          <p className="text-sm text-on-surface-variant">납입번호: <span className="font-mono font-semibold text-on-surface">{result.paymentNo}</span></p>
          <p className="text-sm text-primary font-bold">{fmt(result.totalAmount)}</p>
          <button onClick={() => { setStep(0); setSelected({}); setPreview(null); setResult(null); }} className="btn-secondary w-full">다시 납입</button>
        </div>
      )}
    </div>
  );
}
