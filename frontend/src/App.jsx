import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CompaniesPage from './pages/CompaniesPage';
import RoomsPage from './pages/RoomsPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import MembershipManagementPage from './pages/MembershipManagementPage';
import MyReservationsPage from './pages/MyReservationsPage';
import './App.css';
import CompanyDetailsPage from './pages/CompanyDetailsPage';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<CompaniesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomDetailsPage />} />
          <Route path="/my-reservations" element={<MyReservationsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/memberships" element={<MembershipManagementPage />} />
          <Route path="/companies/:companyId" element={<CompanyDetailsPage />} />
          <Route path="*" element={<main><h1>Page Not Found</h1></main>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
