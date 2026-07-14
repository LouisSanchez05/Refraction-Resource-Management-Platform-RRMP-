import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { apiRequest } from '../services/api';

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await apiRequest('/auth/me');
        setUser(response.user ?? response);
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, []);

  function handleLogout() {
    window.location.href = 'http://localhost:3000/auth/logout';
  }

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="navbar">
      <h2>RRMP</h2>

      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/rooms">Rooms</NavLink>
        <NavLink to="/my-reservations">My Reservations</NavLink>

        {isAdmin && (
          <>
            <NavLink to="/">Companies</NavLink>
            <NavLink to="/reports">Reports</NavLink>
            <NavLink to="/admin/users">Users</NavLink>
            <NavLink to="/admin/memberships">
              Memberships
            </NavLink>
          </>
        )}

        {user ? (
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <a href="http://localhost:3000/auth/google">
            Login
          </a>
        )}
      </div>
    </nav>
  );
}

export default Navbar;