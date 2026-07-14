import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../services/api';


function CompanyDetailsPage() {
  const { companyId } = useParams();
  const [users, setUsers] = useState([]);
  const [company, setCompany] = useState(null);
  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  );
  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

    useEffect(() => {
    async function loadCompany() {
        setLoading(true);
        setError('');

        try {
        const [companyData, usersData] = await Promise.all([
            apiRequest(
            `/api/companies/${companyId}?month=${month}&year=${year}`
            ),
            apiRequest('/api/admin/users'),
        ]);

        setCompany(companyData);

        setUsers(
            usersData.filter(
            (user) =>
                Number(user.company_id) === Number(companyId)
            )
        );
        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    }

    loadCompany();
    }, [companyId, month, year]);

  return (
    <main>
      <Link to="/">Back to companies</Link>

      <h1>Company Details</h1>
      <section className="company-users-section">
  <h2>Assigned Users</h2>

  {users.length === 0 ? (
    <p>No users are currently assigned to this company.</p>
  ) : (
    <div className="user-grid">
      {users.map((user) => (
        <article className="user-card" key={user.id}>
          <h3>{user.name || 'Unnamed User'}</h3>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </article>
      ))}
    </div>
  )}
</section>


      <section className="report-filters">
        <label>
          Month
          <select
            value={month}
            onChange={(event) =>
              setMonth(Number(event.target.value))
            }
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>

        <label>
          Year
          <input
            type="number"
            value={year}
            onChange={(event) =>
              setYear(Number(event.target.value))
            }
          />
        </label>
      </section>

      {loading && <p>Loading company...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && company && (
        <section className="dashboard-card">
          <h2>{company.name}</h2>

          <p>
            <strong>Membership plan:</strong>{' '}
            {company.membership_plan || 'Not assigned'}
          </p>

          <p>
            <strong>Included hours:</strong>{' '}
            {company.monthly_hours ?? 'N/A'}
          </p>

          <p>
            <strong>Hours used:</strong>{' '}
            {company.hours_used ?? 0}
          </p>

          <p>
            <strong>Remaining hours:</strong>{' '}
            {company.remaining_hours ?? 'N/A'}
          </p>

          <p>
            <strong>Overage hours:</strong>{' '}
            {company.overage_hours ?? 0}
          </p>

          <p>
            <strong>Overage cost:</strong> $
            {company.overage_cost ?? 0}
          </p>
        </section>

        
      )}
    </main>
  );
}

export default CompanyDetailsPage;