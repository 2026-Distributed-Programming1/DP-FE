import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createAccident, ACCIDENT_TYPE_LABEL } from '../../api/accidents';

const ACCIDENT_TYPES = Object.entries(ACCIDENT_TYPE_LABEL).map(([value, label]) => ({ value, label }));

const INITIAL = {
  vehicleNo: '',
  ownerName: '',
  phoneNo: '',
  accidentType: 'PROPERTY',
  damageType: '',
  location: '',
  needsDispatch: false,
  agreedTerms: false,
  casualtyCount: 0,
  injurySeverity: '',
  emergencyReported: false,
};

export default function AccidentReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({
    ...f,
    [k]: e.target.type === 'checkbox'
      ? e.target.checked
      : e.target.type === 'number'
        ? Number(e.target.value)
        : e.target.value,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreedTerms) { setError('개인정보 수집에 동의해주세요.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const data = await createAccident({
        ...form,
        customerId: user.linkedCustomerNo,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || '사고 접수에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="card p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
          </div>
          <h2 className="font-bold text-lg text-on-surface">사고 접수 완료</h2>
          <p className="text-sm text-on-surface-variant">접수번호: <span className="font-mono font-semibold text-on-surface">{result.reportNo}</span></p>
          {result.dispatchNo && (
            <div className="bg-primary/5 rounded-lg px-4 py-3 text-sm text-primary font-medium">
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">emergency_share</span>
              출동 요청 완료 — 출동번호: {result.dispatchNo}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => navigate('/my/claims')} className="btn-secondary flex-1">청구 목록</button>
            <button onClick={() => navigate('/my/contracts')} className="btn-primary flex-1">내 계약</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">사고 접수</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">사고 정보를 입력하면 담당자가 빠르게 조치합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* 차량 정보 */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-primary uppercase tracking-wide mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">directions_car</span>
            차량 정보
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">차량번호 *</label>
              <input className="input text-sm" placeholder="12가 3456" value={form.vehicleNo} onChange={set('vehicleNo')} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">소유자명 *</label>
              <input className="input text-sm" value={form.ownerName} onChange={set('ownerName')} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">연락처 *</label>
            <input className="input text-sm" placeholder="010-1234-5678" value={form.phoneNo} onChange={set('phoneNo')} required />
          </div>
        </fieldset>

        <div className="border-t border-outline-variant/50" />

        {/* 사고 정보 */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-primary uppercase tracking-wide mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">car_crash</span>
            사고 정보
          </legend>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">사고 유형 *</label>
            <div className="flex gap-2">
              {ACCIDENT_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, accidentType: value }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors
                    ${form.accidentType === value
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary/50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">피해 유형 *</label>
            <input className="input text-sm" placeholder="예: 추돌, 측면 충돌" value={form.damageType} onChange={set('damageType')} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">사고 위치 *</label>
            <input className="input text-sm" placeholder="예: 서울시 강남구 테헤란로" value={form.location} onChange={set('location')} required />
          </div>
          {form.accidentType === 'PERSONAL' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">부상자 수</label>
                <input type="number" min="0" className="input text-sm" value={form.casualtyCount} onChange={set('casualtyCount')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">부상 정도</label>
                <input className="input text-sm" placeholder="경상/중상" value={form.injurySeverity} onChange={set('injurySeverity')} />
              </div>
            </div>
          )}
        </fieldset>

        <div className="border-t border-outline-variant/50" />

        {/* 출동 요청 */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-primary uppercase tracking-wide mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">emergency_share</span>
            추가 옵션
          </legend>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="accent-primary w-4 h-4" checked={form.needsDispatch} onChange={set('needsDispatch')} />
            <span className="text-sm text-on-surface">현장 출동 요청</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="accent-primary w-4 h-4" checked={form.emergencyReported} onChange={set('emergencyReported')} />
            <span className="text-sm text-on-surface">112/119 신고 완료</span>
          </label>
        </fieldset>

        <div className="border-t border-outline-variant/50" />

        {/* 동의 */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="accent-primary w-4 h-4 mt-0.5" checked={form.agreedTerms} onChange={set('agreedTerms')} />
          <span className="text-xs text-on-surface-variant leading-relaxed">
            개인정보 수집·이용에 동의합니다. 수집된 정보는 사고 처리 목적으로만 사용됩니다.
          </span>
        </label>

        {error && <p className="text-xs text-error bg-error-container/30 px-3 py-2 rounded-lg">{error}</p>}

        <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
          {submitting ? '접수 중...' : '사고 접수하기'}
        </button>
      </form>
    </div>
  );
}
