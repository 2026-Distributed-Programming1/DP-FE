import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from './menuConfig';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = user ? getMenuItems(user.role) : [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-glass-bg border-b border-glass-border backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between h-full px-6 max-w-[1280px] mx-auto gap-6">

        {/* 브랜드 */}
        <span className="text-primary font-bold text-lg shrink-0 tracking-tight">
          Kindred Assurance
        </span>

        {/* 내비게이션 링크 */}
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link shrink-0 ${isActive ? 'nav-link-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* 우측 사용자 영역 */}
        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <>
              <span className="text-xs text-on-surface-variant hidden sm:block">
                {user.displayName}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  account_circle
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost text-xs px-2 py-1"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
