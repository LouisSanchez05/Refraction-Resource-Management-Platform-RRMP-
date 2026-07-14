import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <h2>RRMP</h2>

      <div className="nav-links">
        <NavLink to="/">Companies</NavLink>
        <NavLink to="/rooms">Rooms</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/admin/users">Users</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;