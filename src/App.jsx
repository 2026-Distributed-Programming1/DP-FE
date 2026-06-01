import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ContractListPage from './pages/contracts/ContractListPage';
import ClaimListPage from './pages/claims/ClaimListPage';
import SalesActivityListPage from './pages/salesActivities/SalesActivityListPage';
import EducationPlanListPage from './pages/educationPlans/EducationPlanListPage';
import InquiryListPage from './pages/inquiries/InquiryListPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/contracts" replace />} />
        <Route path="/contracts" element={<ContractListPage />} />
        <Route path="/claims" element={<ClaimListPage />} />
        <Route path="/sales-activities" element={<SalesActivityListPage />} />
        <Route path="/education-plans" element={<EducationPlanListPage />} />
        <Route path="/inquiries" element={<InquiryListPage />} />
      </Routes>
    </BrowserRouter>
  );
}
