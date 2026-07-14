import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

function MembershipManagementPage() {
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);

  const [companyId, setCompanyId] = useState('');
  const [planId, setPlanId] = useState('');

  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  );

  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadMembershipData() {
      try {
        const [companiesData, plansData] =
          await Promise.all([
            apiRequest('/api/admin/companies'),
            apiRequest('/api/memberships/plans'),
          ]);

        setCompanies(companiesData);
        setPlans(plansData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadMembershipData();
  }, []);

  async function handleAssignMembership(event) {
    event.preventDefault();

    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      await apiRequest('/api/memberships/assign', {
        method: 'POST',
        body: JSON.stringify({
          company_id: Number(companyId),
          plan_id: Number(planId),
          month: Number(month),
          year: Number(year),
        }),
      });

      setMessage(
        'Membership plan assigned successfully.'
      );

      setCompanyId('');
      setPlanId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading membership information...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Membership Management</h1>

      <p>
        Assign a monthly membership plan to a company.
      </p>

      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="error-message">
          Error: {error}
        </p>
      )}

      <section className="membership-section">
        <h2>Assign Membership Plan</h2>

        <form
          className="membership-form"
          onSubmit={handleAssignMembership}
        >
          <label>
            Company

            <select
              value={companyId}
              onChange={(event) =>
                setCompanyId(event.target.value)
              }
              required
            >
              <option value="">
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

          <label>
            Membership plan

            <select
              value={planId}
              onChange={(event) =>
                setPlanId(event.target.value)
              }
              required
            >
              <option value="">
                Select a membership plan
              </option>

              {plans.map((plan) => (
                <option
                  key={plan.id}
                  value={plan.id}
                >
                  {plan.name} —{' '}
                  {plan.monthly_hours} hours
                </option>
              ))}
            </select>
          </label>

          <label>
            Month

            <input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(event) =>
                setMonth(event.target.value)
              }
              required
            />
          </label>

          <label>
            Year

            <input
              type="number"
              min="2026"
              value={year}
              onChange={(event) =>
                setYear(event.target.value)
              }
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? 'Assigning...'
              : 'Assign Membership'}
          </button>
        </form>
      </section>

      <section className="membership-section">
        <h2>Available Membership Plans</h2>

        {plans.length === 0 ? (
          <p>No membership plans found.</p>
        ) : (
          <div className="plan-grid">
            {plans.map((plan) => (
              <article
                className="plan-card"
                key={plan.id}
              >
                <h3>{plan.name}</h3>

                <p>
                  <strong>Monthly hours:</strong>{' '}
                  {plan.monthly_hours}
                </p>

                <p>
                  <strong>Overage rate:</strong> $
                  {plan.overage_rate} per hour
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MembershipManagementPage;