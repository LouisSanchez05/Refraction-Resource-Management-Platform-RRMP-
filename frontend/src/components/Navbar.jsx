import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { apiRequest } from '../services/api';

const memberLinks = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: '⌂'
  },
  {
    to: '/rooms',
    label: 'Rooms',
    icon: '▦'
  },
  {
    to: '/my-reservations',
    label: 'My Reservations',
    icon: '✓'
  }
];

const adminLinks = [
  {
    to: '/companies',
    label: 'Companies',
    icon: '▤'
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: '♙'
  },
  {
    to: '/admin/memberships',
    label: 'Memberships',
    icon: '▣'
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: '☷'
  }
];

function Navbar() {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

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
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand">
          
          <div className="brand-logo">
<img src="/refraction-logo.png" alt="Refraction" />
</div>

          {!collapsed && (
            <div className="brand-text">
              <strong>Refraction</strong>
              <span>RRMP</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="collapse-button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="sidebar-navigation">
        <div className="sidebar-group">
          {memberLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              title={collapsed ? link.label : undefined}
            >
              <span className="sidebar-icon">{link.icon}</span>

              {!collapsed && (
                <span className="sidebar-label">{link.label}</span>
              )}
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <>
            {!collapsed && (
              <p className="sidebar-section-label">Administration</p>
            )}

            <div className="sidebar-group">
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  title={collapsed ? link.label : undefined}
                >
                  <span className="sidebar-icon">{link.icon}</span>

                  {!collapsed && (
                    <span className="sidebar-label">{link.label}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="sidebar-user">
              <div className="user-avatar">
                {user.name
                  ?.split(' ')
                  .map((name) => name[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'U'}
              </div>

              {!collapsed && (
                <div className="user-details">
                  <strong>{user.name}</strong>
                  <span>{user.role}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              title={collapsed ? 'Logout' : undefined}
            >
              <span className="sidebar-icon">↪</span>
              {!collapsed && <span>Logout</span>}
            </button>
          </>
        ) : (
          <a
            className="login-button"
            href="http://localhost:3000/auth/google"
          >
            <span className="sidebar-icon">→</span>
            {!collapsed && <span>Login</span>}
          </a>
        )}
      </div>
    </aside>
  );
}

export default Navbar;