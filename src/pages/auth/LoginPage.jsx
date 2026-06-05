import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth, defaultPathForRole } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      const from = location.state?.from?.pathname;
      navigate(from || defaultPathForRole(user), { replace: true });
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* 브랜드 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Kindred Assurance</h1>
          <p className="text-sm text-on-surface-variant mt-1">업무 포털에 로그인하세요</p>
        </div>

        {/* 카드 */}
        <div className="card p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                아이디
              </label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                비밀번호
              </label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="border-t border-outline-variant/50 pt-4 text-center">
            <Link to="/signup" className="text-sm text-primary hover:underline">
              처음이신가요? 회원가입
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
