import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ContractListPage from './pages/contracts/ContractListPage';
import ClaimListPage from './pages/claims/ClaimListPage';
import SalesActivityListPage from './pages/salesActivities/SalesActivityListPage';
import EducationPlanListPage from './pages/educationPlans/EducationPlanListPage';
import InquiryListPage from './pages/inquiries/InquiryListPage';
import ChannelScreeningListPage from './pages/channelScreenings/ChannelScreeningListPage';
import SalesOrgEvaluationListPage from './pages/salesOrgEvaluations/SalesOrgEvaluationListPage';
import AccidentPage from './pages/accidents/AccidentPage';
import ClaimPaymentPage from './pages/claimPayments/ClaimPaymentPage';
import ConsultationPage from './pages/consultations/ConsultationPage';
import UnderwritingListPage from './pages/underwriting/UnderwritingListPage';
import UnderwritingDashboardPage from './pages/underwriting/UnderwritingDashboardPage';
import InterviewSchedulePage from './pages/interviewSchedules/InterviewSchedulePage';
import ChannelRecruitmentPage from './pages/channelRecruitments/ChannelRecruitmentPage';
import InsuranceProductPage from './pages/insuranceProducts/InsuranceProductPage';
import EducationPreparationPage from './pages/educationPlans/EducationPreparationPage';
import EducationExecutionPage from './pages/educationPlans/EducationExecutionPage';
import LoginPage from './pages/auth/LoginPage';

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="/" element={<Navigate to="/contracts" replace />} />
        <Route
          path="/contracts"
          element={<PrivateRoute user={user}><ContractListPage /></PrivateRoute>}
        />
        <Route
          path="/claims"
          element={<PrivateRoute user={user}><ClaimListPage /></PrivateRoute>}
        />
        <Route
          path="/sales-activities"
          element={<PrivateRoute user={user}><SalesActivityListPage /></PrivateRoute>}
        />
        <Route
          path="/education-plans"
          element={<PrivateRoute user={user}><EducationPlanListPage /></PrivateRoute>}
        />
        <Route
          path="/inquiries"
          element={<PrivateRoute user={user}><InquiryListPage /></PrivateRoute>}
        />
        <Route
          path="/channel-screenings"
          element={<PrivateRoute user={user}><ChannelScreeningListPage /></PrivateRoute>}
        />
        <Route
          path="/sales-org-evaluations"
          element={<PrivateRoute user={user}><SalesOrgEvaluationListPage /></PrivateRoute>}
        />
        <Route
          path="/accidents"
          element={<PrivateRoute user={user}><AccidentPage /></PrivateRoute>}
        />
        <Route
          path="/claim-payments"
          element={<PrivateRoute user={user}><ClaimPaymentPage /></PrivateRoute>}
        />
        <Route
          path="/consultations"
          element={<PrivateRoute user={user}><ConsultationPage /></PrivateRoute>}
        />
        <Route
          path="/underwriting"
          element={<PrivateRoute user={user}><UnderwritingListPage /></PrivateRoute>}
        />
        <Route
          path="/underwriting-dashboard"
          element={<PrivateRoute user={user}><UnderwritingDashboardPage /></PrivateRoute>}
        />
        <Route
          path="/interview-schedules"
          element={<PrivateRoute user={user}><InterviewSchedulePage /></PrivateRoute>}
        />
        <Route
          path="/channel-recruitments"
          element={<PrivateRoute user={user}><ChannelRecruitmentPage /></PrivateRoute>}
        />
        <Route
          path="/insurance-products"
          element={<PrivateRoute user={user}><InsuranceProductPage /></PrivateRoute>}
        />
        <Route
          path="/education-preparations"
          element={<PrivateRoute user={user}><EducationPreparationPage /></PrivateRoute>}
        />
        <Route
          path="/education-executions"
          element={<PrivateRoute user={user}><EducationExecutionPage /></PrivateRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}
