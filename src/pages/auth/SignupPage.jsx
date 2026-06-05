import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../api/auth';

const INITIAL = {
  username: '', password: '', passwordConfirm: '',
  name: '', residentNo: '', phone: '', email: '',
  address: '', birthDate: '',
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.username) e.username = '아이디를 입력하세요.';
    if (form.password.length < 8) e.password = '비밀번호는 8자 이상이어야 합니다.';
    if (form.password !== form.passwordConfirm) e.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!form.name) e.name = '이름을 입력하세요.';
    if (!form.residentNo) e.residentNo = '주민등록번호를 입력하세요.';
    if (!form.phone) e.phone = '연락처를 입력하세요.';
    if (!form.address) e.address = '주소를 입력하세요.';
    if (!form.birthDate) e.birthDate = '생년월일을 입력하세요.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setServerError('');
    try {
      const { username, password, name, residentNo, phone, email, address, birthDate } = form;
      await signup({ username, password, name, residentNo, phone, email, address, birthDate });
      navigate('/login', { state: { signupSuccess: true } });
    } catch (err) {
      setServerError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, k, type = 'text', placeholder, required = true }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        className={`input ${errors[k] ? 'border-error ring-error/20' : ''}`}
        placeholder={placeholder}
        value={form[k]}
        onChange={set(k)}
      />
      {errors[k] && <p className="text-xs text-error">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Kindred Assurance</h1>
          <p className="text-sm text-on-surface-variant mt-1">고객 계정을 만들어보세요</p>
        </div>

        <div className="card p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 로그인 정보 */}
            <div className="space-y-3 pb-4 border-b border-outline-variant/50">
              <p className="text-xs font-bold text-primary uppercase tracking-wide">로그인 정보</p>
              <Field label="아이디" k="username" placeholder="영문/숫자 조합" />
              <Field label="비밀번호" k="password" type="password" placeholder="8자 이상" />
              <Field label="비밀번호 확인" k="passwordConfirm" type="password" placeholder="동일하게 입력" />
            </div>

            {/* 개인 정보 */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-primary uppercase tracking-wide">개인 정보</p>
              <Field label="이름" k="name" />
              <Field label="주민등록번호" k="residentNo" placeholder="000000-0000000" />
              <Field label="생년월일" k="birthDate" type="date" />
              <Field label="연락처" k="phone" placeholder="010-0000-0000" />
              <Field label="이메일" k="email" type="email" required={false} placeholder="선택 사항" />
              <Field label="주소" k="address" placeholder="도로명 주소" />
            </div>

            {serverError && (
              <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">
                {serverError}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
              {submitting ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="border-t border-outline-variant/50 pt-4 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-outline mt-6">
          직원 계정은 관리자에게 문의하세요.
        </p>
      </div>
    </div>
  );
}
