import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api/auth';

export default function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = '현재 비밀번호를 입력하세요.';
    if (form.newPassword.length < 8) errs.newPassword = '새 비밀번호는 8자 이상이어야 합니다.';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = '비밀번호가 일치하지 않습니다.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');
    try {
      await changePassword(form.currentPassword, form.newPassword);
      // 변경 완료 후 재로그인 유도 (세션 갱신)
      await logout();
      navigate('/login', { state: { passwordChanged: true } });
    } catch (err) {
      setServerError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">lock</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface">비밀번호 변경</h1>
          {user?.passwordChangeRequired && (
            <p className="text-sm text-error mt-1">
              최초 로그인입니다. 비밀번호를 변경해야 서비스를 이용할 수 있습니다.
            </p>
          )}
          {user && !user.passwordChangeRequired && (
            <p className="text-sm text-on-surface-variant mt-1">
              {user.displayName}님, 현재 비밀번호를 확인한 후 변경하세요.
            </p>
          )}
        </div>

        <div className="card p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: '현재 비밀번호', k: 'currentPassword', placeholder: '현재 비밀번호' },
              { label: '새 비밀번호', k: 'newPassword', placeholder: '8자 이상' },
              { label: '새 비밀번호 확인', k: 'confirmPassword', placeholder: '동일하게 입력' },
            ].map(({ label, k, placeholder }) => (
              <div key={k} className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  {label}
                </label>
                <input
                  type="password"
                  className={`input ${errors[k] ? 'border-error' : ''}`}
                  placeholder={placeholder}
                  value={form[k]}
                  onChange={set(k)}
                  required
                />
                {errors[k] && <p className="text-xs text-error">{errors[k]}</p>}
              </div>
            ))}

            {serverError && (
              <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">
                {serverError}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
              {submitting ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
