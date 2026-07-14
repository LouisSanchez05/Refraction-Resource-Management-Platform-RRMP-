import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CompaniesPage from './pages/CompaniesPage';
import RoomsPage from './pages/RoomsPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import './App.css';
import RoomDetailsPage from './pages/RoomDetailsPage';

function App() {
  return (
    <>
      <Navbar />

<Routes>
  <Route
    path="/"
    element={<CompaniesPage />}
  />

  <Route
    path="/rooms"
    element={<RoomsPage />}
  />

  <Route
    path="/rooms/:roomId"
    element={<RoomDetailsPage />}
  />
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route
  path="/admin/users"
  element={<AdminUsersPage />}
/>
</Routes>
    </>
  );
}

export default App;