import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, isCustomer, isStaff } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import InquiryPage from './pages/inquiries/InquiryPage';
import InsuranceProductPage from './pages/insuranceProducts/InsuranceProductPage';
import ContractListPage from './pages/contracts/ContractListPage';
import AccidentListPage from './pages/accidents/AccidentListPage';
import AccidentReportPage from './pages/accidents/AccidentReportPage';
import SalesActivityListPage from './pages/salesActivities/SalesActivityListPage';
import UnderwritingListPage from './pages/underwriting/UnderwritingListPage';
import ChannelScreeningListPage from './pages/channelScreenings/ChannelScreeningListPage';
import SalesOrgEvaluationListPage from './pages/salesOrgEvaluations/SalesOrgEvaluationListPage';
import EducationPlanListPage from './pages/educationPlans/EducationPlanListPage';
import ConsultationPage from './pages/consultations/ConsultationPage';
import ClaimListPage from './pages/claims/ClaimListPage';
import ChannelRecruitmentPage from './pages/channelRecruitments/ChannelRecruitmentPage';
import InterviewSchedulePage from './pages/interviewSchedules/InterviewSchedulePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ClaimPaymentPage from './pages/claimPayments/ClaimPaymentPage';
import PaymentPage from './pages/customer/PaymentPage';
import InsuranceApplicationPage from './pages/customer/InsuranceApplicationPage';
import RevivalPage from './pages/customer/RevivalPage';
import InterviewRecordPage from './pages/interviewRecords/InterviewRecordPage';
import EducationPreparationPage from './pages/educationPlans/EducationPreparationPage';
import EducationExecutionPage from './pages/educationPlans/EducationExecutionPage';
import LandingPage from './pages/landing/LandingPage';
import ExpiringContractsPage from './pages/contracts/ExpiringContractsPage';
import ContractStatisticsPage from './pages/contracts/ContractStatisticsPage';
import CancellationsPage from './pages/contracts/CancellationsPage';
import PaymentRecordsPage from './pages/finance/PaymentRecordsPage';
import RefundsPage from './pages/finance/RefundsPage';
import ActivityPlansPage from './pages/sales/ActivityPlansPage';
import CustomerRegistrationsPage from './pages/sales/CustomerRegistrationsPage';
import PolicyApplicationsPage from './pages/sales/PolicyApplicationsPage';

// ── 플레이스홀더 ────────────────────────────────────────────────
function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-on-surface-variant">
      <span className="material-symbols-outlined text-4xl text-outline">construction</span>
      <span className="text-sm">{title} — 준비 중</span>
    </div>
  );
}

// ── 스피너 ──────────────────────────────────────────────────────
function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── 가드 ────────────────────────────────────────────────────────

// 로그인 필요. passwordChangeRequired 이면 /change-password 로 강제.
function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.passwordChangeRequired && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }
  return <Outlet />;
}

// 고객 전용
function RequireCustomer() {
  const { user } = useAuth();
  if (!isCustomer(user?.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// 직원/관리자 전용
function RequireStaff() {
  const { user } = useAuth();
  if (!isStaff(user?.role)) return <Navigate to="/my/contracts" replace />;
  return <Outlet />;
}

// 이미 로그인된 상태에서 /login, /signup 접근 시 홈으로
function RedirectIfLoggedIn({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to={defaultPathForRole(user)} replace />;
  return children;
}

// ── 라우팅 ──────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* 공개 — 메인 랜딩 (로그인 불필요) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"  element={<RedirectIfLoggedIn><LoginPage /></RedirectIfLoggedIn>} />
      <Route path="/signup" element={<RedirectIfLoggedIn><SignupPage /></RedirectIfLoggedIn>} />

      {/* 인증 필요 전체 영역 */}
      <Route element={<RequireAuth />}>

        {/* 비밀번호 변경 (레이아웃 없이) */}
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Layout이 감싸는 모든 페이지 */}
        <Route element={<Layout />}>

          {/* 공용 (고객 + 직원 모두) */}
          <Route path="/insurance-products" element={<InsuranceProductPage />} />
          <Route path="/consultations/new"  element={<ConsultationPage />} />

          {/* ── 고객 전용 /my/* ─────────────────────── */}
          <Route element={<RequireCustomer />}>
            <Route path="/my/contracts"                   element={<ContractListPage />} />
            <Route path="/my/payments"                    element={<PaymentPage />} />
            <Route path="/my/accidents/new"               element={<AccidentReportPage />} />
            <Route path="/my/claims"                      element={<ClaimListPage />} />
            <Route path="/my/inquiries"                   element={<InquiryPage />} />
            <Route path="/my/insurance-applications/new"  element={<InsuranceApplicationPage />} />
            <Route path="/my/revivals/new"                element={<RevivalPage />} />
          </Route>

          {/* ── 직원/관리자 전용 ─────────────────────── */}
          <Route element={<RequireStaff />}>
            <Route path="/dashboard"              element={<DashboardPage />} />

            {/* 계약 */}
            <Route path="/contracts"              element={<ContractListPage />} />
            <Route path="/expiring-contracts"     element={<ExpiringContractsPage />} />
            <Route path="/contract-statistics"    element={<ContractStatisticsPage />} />

            {/* 납입·환급 */}
            <Route path="/payment-records"        element={<PaymentRecordsPage />} />
            <Route path="/cancellations"          element={<CancellationsPage />} />
            <Route path="/refunds"                element={<RefundsPage />} />

            {/* 보상·청구 */}
            <Route path="/accidents"              element={<AccidentListPage />} />
            <Route path="/claims"                 element={<ClaimListPage />} />
            <Route path="/claim-payments"         element={<ClaimPaymentPage />} />

            {/* 상담·인수심사 */}
            <Route path="/consultations"          element={<ConsultationPage />} />
            <Route path="/interview-schedules"    element={<InterviewSchedulePage />} />
            <Route path="/interview-records"      element={<InterviewRecordPage />} />
            <Route path="/underwriting"           element={<UnderwritingListPage />} />
            <Route path="/policy-applications"    element={<PolicyApplicationsPage />} />

            {/* 영업 */}
            <Route path="/sales-activities"       element={<SalesActivityListPage />} />
            <Route path="/channel-screenings"     element={<ChannelScreeningListPage />} />
            <Route path="/channel-recruitments"   element={<ChannelRecruitmentPage />} />
            <Route path="/sales-org-evaluations"  element={<SalesOrgEvaluationListPage />} />
            <Route path="/activity-plans"         element={<ActivityPlansPage />} />
            <Route path="/customer-registrations" element={<CustomerRegistrationsPage />} />

            {/* 교육 */}
            <Route path="/education-plans"        element={<EducationPlanListPage />} />
            <Route path="/education-preparations" element={<EducationPreparationPage />} />
            <Route path="/education-executions"   element={<EducationExecutionPage />} />

            {/* 고객센터 */}
            <Route path="/inquiries"              element={<InquiryPage />} />
          </Route>

        </Route>{/* Layout */}
      </Route>{/* RequireAuth */}

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
