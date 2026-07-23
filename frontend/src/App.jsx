import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import CompaniesPage from './pages/CompaniesPage';
import RoomsPage from './pages/RoomsPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import MembershipManagementPage from './pages/MembershipManagementPage';
import MyReservationsPage from './pages/MyReservationsPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import LoginPage from './pages/LoginPage';
import './App.css';


function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-main">
        <header className="topbar">
          <div>
            <p className="topbar-eyebrow">Refraction Innovation Hub</p>
            <p className="topbar-title">Resource Management Platform</p>
          </div>
        </header>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/rooms/:roomId" element={<RoomDetailsPage />} />

            <Route
              path="/my-reservations"
              element={<MyReservationsPage />}
            />

            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />

            <Route
              path="/admin/memberships"
              element={<MembershipManagementPage />}
            />

            <Route
              path="/companies/:companyId"
              element={<CompanyDetailsPage />}
            />

            <Route
              path="*"
              element={
                <section className="page-section">
                  <h1>Page not found</h1>
                  <p>The page you requested does not exist.</p>
                </section>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;