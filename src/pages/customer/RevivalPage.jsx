import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createRevival } from '../../api/insuranceApplications';

export default function RevivalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    contractNo: '', contact: '', unpaidAmount: '', paymentMethod: 'IMMEDIATE_TRANSFER',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = await createRevival({
        customerId: user.linkedCustomerNo,
        customerName: user.displayName,
        contractNo: form.contractNo,
        contact: form.contact,
        unpaidAmount: Number(form.unpaidAmount),
        paymentMethod: form.paymentMethod,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || '부활 신청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) return (
    <div className="max-w-md mx-auto">
      <div className="card p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
        </div>
        <h3 className="font-bold text-lg text-on-surface">부활 신청 완료</h3>
        <p className="text-sm text-on-surface-variant">신청번호: <span className="font-mono font-semibold">{result.revivalNo}</span></p>
        <p className="text-sm text-on-surface">계약 {result.contractNo}</p>
        <button onClick={() => navigate('/my/contracts')} className="btn-primary w-full">내 계약 확인</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">부활 요청</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">실효된 계약을 다시 살리려면 미납 보험료를 납입해야 합니다.</p>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="bg-error-container/20 rounded-lg p-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-error text-[16px] mt-0.5">info</span>
          <p className="text-xs text-error leading-relaxed">부활 신청 후 심사 결과에 따라 계약이 복원됩니다. 미납 보험료와 연체 이자를 확인하세요.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">계약번호 *</label>
          <input className="input" placeholder="예: CON00001" value={form.contractNo} onChange={set('contractNo')} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">연락처 *</label>
          <input className="input" placeholder="010-0000-0000" value={form.contact} onChange={set('contact')} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">미납 보험료 (원) *</label>
          <input type="number" className="input" placeholder="0" value={form.unpaidAmount} onChange={set('unpaidAmount')} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">납입 방법</label>
          <div className="flex gap-2">
            {[{ v: 'IMMEDIATE_TRANSFER', l: '즉시이체' }, { v: 'VIRTUAL_ACCOUNT', l: '가상계좌' }].map(({ v, l }) => (
              <button key={v} type="button" onClick={() => setForm(f => ({ ...f, paymentMethod: v }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors ${form.paymentMethod === v ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant'}`}>{l}</button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-error bg-error-container/30 px-3 py-2 rounded-lg">{error}</p>}
        <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
          {submitting ? '신청 중...' : '부활 신청'}
        </button>
      </form>
    </div>
  );
}
