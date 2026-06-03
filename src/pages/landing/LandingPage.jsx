import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, isCustomer, isStaff, defaultPathForRole } from '../../context/AuthContext';
import { fetchInsuranceProducts } from '../../api/insuranceProducts';

// ── 랜딩 전용 네비바 ─────────────────────────────────────────────
function LandingNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-glass-bg border-b border-glass-border backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between h-full px-6 max-w-[1280px] mx-auto">
        <Link to="/" className="text-primary font-bold text-lg tracking-tight">
          Kindred Assurance
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/insurance-products" className="nav-link">보험상품</Link>
          <Link to="/consultations/new" className="nav-link">상담 신청</Link>
          <Link to="/inquiries" className="nav-link">문의</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                onClick={() => navigate(defaultPathForRole(user))}
                className="btn-primary text-xs px-4 py-2"
              >
                {isCustomer(user.role) ? '내 포털' : '업무 포털'}
              </button>
              <button onClick={handleLogout} className="btn-ghost text-xs px-3 py-2">로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-xs px-4 py-2">로그인</Link>
              <Link to="/signup" className="btn-primary text-xs px-4 py-2">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ── 빠른 메뉴 타일 ────────────────────────────────────────────────
function QuickTile({ icon, label, to, requireAuth, bgCls }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (requireAuth && !user) {
      navigate('/login', { state: { from: { pathname: to } } });
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`glass-panel p-6 rounded-xl flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group`}
    >
      <div className={`w-16 h-16 ${bgCls} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
      </div>
      <span className="font-semibold text-sm text-on-surface">{label}</span>
    </button>
  );
}

// ── 상품 카드 ─────────────────────────────────────────────────────
const CATEGORY_ICON = { '자동차': 'directions_car', '건강': 'favorite', '화재': 'local_fire_department', '여행': 'travel_explore', '운전자': 'person' };

function ProductCard({ product }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate('/insurance-products')}
      className="glass-panel p-6 rounded-xl flex flex-col gap-4 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl">
            {CATEGORY_ICON[product.category] ?? 'shield'}
          </span>
        </div>
        <span className="badge bg-surface-container text-on-surface-variant text-[11px]">{product.category}</span>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-on-surface">{product.productName}</h3>
        <p className="text-sm text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">{product.coverageSummary}</p>
      </div>
      <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
        <span className="text-xs text-outline">월 보험료</span>
        <span className="font-bold text-primary">{product.monthlyPremium?.toLocaleString('ko-KR')}원~</span>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // 로그인된 경우만 상품 조회 (API가 세션 필요)
    if (user) {
      fetchInsuranceProducts()
        .then((d) => setProducts((d.items ?? []).slice(0, 3)))
        .catch(() => {});
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* 히어로 */}
      <section className="pt-32 pb-20 px-6 max-w-[1280px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          {/* 텍스트 */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-6 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Kindred Assurance — 스마트한 보험 관리
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-on-surface leading-tight tracking-tight mb-6">
              당신의 일상이<br />
              <span className="text-primary">더욱 안전해지도록</span>
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
              라이프스타일에 맞춘 최적의 보험 솔루션을 만나보세요.<br />
              복잡한 보험도 Kindred라면 투명하고 간편합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <button
                  onClick={() => navigate(defaultPathForRole(user))}
                  className="btn-primary px-8 py-3 text-sm"
                >
                  {isCustomer(user.role) ? '내 포털로 이동' : '업무 포털로 이동'}
                  <span className="material-symbols-outlined text-[18px] ml-2 align-middle">arrow_forward</span>
                </button>
              ) : (
                <>
                  <Link to="/signup" className="btn-primary px-8 py-3 text-sm">
                    무료로 시작하기
                  </Link>
                  <Link to="/login" className="btn-secondary px-8 py-3 text-sm">
                    로그인
                  </Link>
                </>
              )}
              <Link to="/insurance-products" className="btn-ghost px-8 py-3 text-sm border border-outline-variant">
                보험상품 보기
              </Link>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="glass-panel p-8 rounded-2xl shadow-lg space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">shield</span>
                </div>
                <div>
                  <p className="text-xs text-outline">안심 보험 서비스</p>
                  <p className="font-bold text-on-surface">Kindred Assurance</p>
                </div>
              </div>
              {[
                { icon: 'verified_user', label: '인수심사 당일 완료', value: '평균 4시간' },
                { icon: 'payments', label: '보험금 신속 지급', value: '평균 3일' },
                { icon: 'support_agent', label: '고객 만족도', value: '98.4%' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
                    <span className="text-sm text-on-surface-variant">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 빠른 메뉴 */}
      <section className="px-6 pb-20 max-w-[1280px] mx-auto">
        <h2 className="text-xl font-bold text-on-surface mb-6">바로 시작하세요</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickTile icon="shield"        label="보험상품 조회"  to="/insurance-products"      bgCls="bg-primary/10"    requireAuth={false} />
          <QuickTile icon="support_agent" label="상담 신청"      to="/consultations/new"        bgCls="bg-secondary-container/30" requireAuth={true} />
          <QuickTile icon="car_crash"     label="사고 접수"      to="/my/accidents/new"         bgCls="bg-error-container/30" requireAuth={true} />
          <QuickTile icon="help"          label="문의하기"       to="/my/inquiries"             bgCls="bg-surface-container" requireAuth={true} />
        </div>
      </section>

      {/* 추천 상품 (로그인 시) */}
      {products.length > 0 && (
        <section className="px-6 pb-20 max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-on-surface">추천 보험상품</h2>
            <Link to="/insurance-products" className="text-sm text-primary hover:underline flex items-center gap-1">
              전체 보기 <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p) => <ProductCard key={p.productName} product={p} />)}
          </div>
        </section>
      )}

      {/* 로그인 유도 (비로그인 시) */}
      {!user && (
        <section className="px-6 pb-20 max-w-[1280px] mx-auto">
          <div className="glass-panel rounded-2xl p-10 text-center space-y-4">
            <span className="material-symbols-outlined text-primary text-4xl">lock_open</span>
            <h3 className="text-xl font-bold text-on-surface">지금 가입하고 모든 서비스를 이용하세요</h3>
            <p className="text-on-surface-variant">계약 조회, 보험금 청구, 사고 접수까지 — 모든 보험 업무를 한 곳에서.</p>
            <div className="flex justify-center gap-3 pt-2">
              <Link to="/signup" className="btn-primary px-8 py-2.5">무료 회원가입</Link>
              <Link to="/login" className="btn-secondary px-8 py-2.5">로그인</Link>
            </div>
          </div>
        </section>
      )}

      {/* 푸터 */}
      <footer className="border-t border-outline-variant/50 py-8 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-outline">
          <span className="font-semibold text-primary">Kindred Assurance</span>
          <span>© 2026 Kindred Assurance. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/insurance-products" className="hover:text-primary transition-colors">보험상품</Link>
            <Link to="/consultations/new" className="hover:text-primary transition-colors">상담신청</Link>
            <Link to="/login" className="hover:text-primary transition-colors">로그인</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
