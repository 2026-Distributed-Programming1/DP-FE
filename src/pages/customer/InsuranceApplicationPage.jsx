import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createInsuranceApplication } from '../../api/insuranceApplications';

export default function InsuranceApplicationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedProduct = location.state?.product;

  const [productName, setProductName] = useState(preSelectedProduct?.productName ?? '');
  const [paymentMethod, setPaymentMethod] = useState('IMMEDIATE_TRANSFER');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName) { setError('상품명을 입력하세요.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const data = await createInsuranceApplication({
        customerId: user.linkedCustomerNo,
        customerName: user.displayName,
        productName,
        paymentMethod,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || '신청에 실패했습니다.');
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
        <h3 className="font-bold text-lg text-on-surface">보험 신청 완료</h3>
        <p className="text-sm text-on-surface-variant">신청번호: <span className="font-mono font-semibold">{result.applicationNo}</span></p>
        <p className="text-sm text-on-surface">{result.productName}</p>
        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate('/insurance-products')} className="btn-secondary flex-1">상품 목록</button>
          <button onClick={() => navigate('/my/contracts')} className="btn-primary flex-1">내 계약</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">보험 신청</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">원하는 상품을 선택하고 신청하세요.</p>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {preSelectedProduct ? (
          <div className="bg-primary/5 rounded-lg p-4 space-y-1">
            <p className="text-xs text-on-surface-variant">선택된 상품</p>
            <p className="font-bold text-on-surface">{preSelectedProduct.productName}</p>
            <p className="text-sm text-primary font-semibold">월 {preSelectedProduct.monthlyPremium?.toLocaleString()}원</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">상품명 *</label>
            <input className="input" placeholder="예: 자동차보험 기본형" value={productName} onChange={e => setProductName(e.target.value)} required />
            <p className="text-xs text-outline">보험상품 페이지에서 상품을 선택하면 자동 입력됩니다.</p>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">납입 방법</label>
          <div className="flex gap-2">
            {[{ v: 'IMMEDIATE_TRANSFER', l: '즉시이체' }, { v: 'VIRTUAL_ACCOUNT', l: '가상계좌' }].map(({ v, l }) => (
              <button key={v} type="button" onClick={() => setPaymentMethod(v)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors ${paymentMethod === v ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant'}`}>{l}</button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
          {submitting ? '신청 중...' : '보험 신청'}
        </button>
      </form>
    </div>
  );
}
