import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const authResponse = await apiRequest('/auth/me');
        const currentUser = authResponse.user ?? authResponse;

        setUser(currentUser);

        if (currentUser?.company_id) {
          const balanceData = await apiRequest(
            `/api/memberships/balance/${currentUser.company_id}`
          );

          setBalance(balanceData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Dashboard</h1>

      {error && <p>Error: {error}</p>}

      {user && (
        <section className="dashboard-card">
          <h2>Welcome, {user.name}</h2>
          <p><strong>Role:</strong> {user.role}</p>
          <p>
            <strong>Company ID:</strong>{' '}
            {user.company_id ?? 'Not assigned'}
          </p>
        </section>
      )}

      {user && !user.company_id && (
        <p>
          Your account must be assigned to a company before
          membership information can be displayed.
        </p>
      )}

      {balance && (
        <section className="dashboard-card">
          <h2>Company Balance</h2>
          <p><strong>Plan:</strong> {balance.plan_name}</p>
          <p>
            <strong>Included hours:</strong>{' '}
            {balance.monthly_hours}
          </p>
          <p>
            <strong>Used hours:</strong>{' '}
            {balance.hours_used}
          </p>
          <p>
            <strong>Remaining hours:</strong>{' '}
            {balance.remaining_hours}
          </p>
          <p>
            <strong>Overage hours:</strong>{' '}
            {balance.overage_hours}
          </p>
          <p>
            <strong>Overage cost:</strong> $
            {balance.overage_cost}
          </p>
        </section>
      )}
    </main>
  );
}

export default DashboardPage;