import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [usersData, companiesData] = await Promise.all([
          apiRequest('/api/admin/users'),
          apiRequest('/api/admin/companies'),
        ]);

        setUsers(usersData);
        setCompanies(companiesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleRoleChange(userId, role) {
    setMessage('');

    try {
      const updatedUser = await apiRequest(
        `/api/admin/users/${userId}/role`,
        {
          method: 'PATCH',
          body: JSON.stringify({ role }),
        }
      );

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? { ...user, ...updatedUser }
            : user
        )
      );

      setMessage('User role updated.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleCompanyChange(userId, companyId) {
    setMessage('');

    try {
      const updatedUser = await apiRequest(
        `/api/admin/users/${userId}/company/${companyId}`,
        {
          method: 'PATCH',
        }
      );

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? { ...user, ...updatedUser }
            : user
        )
      );

      setMessage('User company updated.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading users...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>User Management</h1>

      {error && <p>Error: {error}</p>}
      {message && <p>{message}</p>}

      <div className="user-grid">
        {users.map((user) => (
          <article className="user-card" key={user.id}>
            <h2>{user.name || 'Unnamed User'}</h2>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <label>
              Role
              <select
                value={user.role}
                onChange={(event) =>
                  handleRoleChange(
                    user.id,
                    event.target.value
                  )
                }
              >
                <option value="member">Member</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label>
              Company
              <select
                value={user.company_id ?? ''}
                onChange={(event) =>
                  handleCompanyChange(
                    user.id,
                    Number(event.target.value)
                  )
                }
              >
                <option value="" disabled>
                  Select a company
                </option>

                {companies.map((company) => (
                  <option
                    key={company.id}
                    value={company.id}
                  >
                    {company.name}
                  </option>
                ))}
              </select>
            </label>
          </article>
        ))}
      </div>
    </main>
  );
}

export default AdminUsersPage;