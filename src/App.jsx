import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ContractListPage from './pages/contracts/ContractListPage';
import ClaimListPage from './pages/claims/ClaimListPage';
import SalesActivityListPage from './pages/salesActivities/SalesActivityListPage';
import EducationPlanListPage from './pages/educationPlans/EducationPlanListPage';
import InquiryListPage from './pages/inquiries/InquiryListPage';
import ChannelScreeningListPage from './pages/channelScreenings/ChannelScreeningListPage';
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
      </Routes>
    </BrowserRouter>
  );
}