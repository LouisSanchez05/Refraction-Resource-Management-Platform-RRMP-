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
  const [deletingPlanId, setDeletingPlanId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editMonthlyHours, setEditMonthlyHours] = useState('');
  const [editOverageRate, setEditOverageRate] = useState('');
  const [newPlan, setNewPlan] = useState({
  name: '',
  monthly_hours: '',
  overage_rate: '',
});

const [creatingPlan, setCreatingPlan] = useState(false);
const [planMessage, setPlanMessage] = useState('');

useEffect(() => {
  async function loadData() {
    try {
      await loadMembershipData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);

  async function loadMembershipData() {
  const [companiesData, plansData] = await Promise.all([
    apiRequest('/api/admin/companies'),
    apiRequest('/api/memberships/plans'),
  ]);

  setCompanies(companiesData);
  setPlans(plansData);
}
async function handleCreatePlan(event) {
  event.preventDefault();

  const name = newPlan.name.trim();
  const monthlyHours = Number(newPlan.monthly_hours);
  const overageRate = Number(newPlan.overage_rate);

  if (!name) {
    setPlanMessage('Plan name is required.');
    return;
  }

  if (
    !Number.isFinite(monthlyHours) ||
    monthlyHours < 0
  ) {
    setPlanMessage(
      'Monthly hours must be zero or greater.'
    );
    return;
  }

  if (
    !Number.isFinite(overageRate) ||
    overageRate < 0
  ) {
    setPlanMessage(
      'Overage rate must be zero or greater.'
    );
    return;
  }

  setCreatingPlan(true);
  setPlanMessage('');

  try {
    const createdPlan = await apiRequest(
      '/api/memberships/plans',
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          monthly_hours: monthlyHours,
          overage_rate: overageRate,
        }),
      }
    );

    setPlans((current) =>
      [...current, createdPlan].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

    setNewPlan({
      name: '',
      monthly_hours: '',
      overage_rate: '',
    });

    setPlanMessage('Membership plan created.');
  } catch (err) {
    setPlanMessage(err.message);
  } finally {
    setCreatingPlan(false);
  }
}

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

await loadMembershipData();

setMessage('Membership plan assigned successfully.');
setCompanyId('');
setPlanId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEditingPlan(plan) {
  setEditingPlanId(plan.id);
  setEditPlanName(plan.name);
  setEditMonthlyHours(plan.monthly_hours);
  setEditOverageRate(plan.overage_rate);
  setMessage('');
  setError('');
}

function stopEditingPlan() {
  setEditingPlanId(null);
  setEditPlanName('');
  setEditMonthlyHours('');
  setEditOverageRate('');
}

async function handleUpdatePlan(planId) {
  setMessage('');
  setError('');

  try {
    const updatedPlan = await apiRequest(
      `/api/memberships/plans/${planId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          name: editPlanName,
          monthly_hours: Number(editMonthlyHours),
          overage_rate: Number(editOverageRate),
        }),
      }
    );

    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? { ...plan, ...updatedPlan }
          : plan
      )
    );

    setMessage('Membership plan updated successfully.');
    stopEditingPlan();
  } catch (err) {
    setError(err.message);
  }
}
async function handleDeletePlan(plan) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${plan.name}"?\n\n` +
      'Plans currently assigned to companies cannot be deleted.'
  );

  if (!confirmed) {
    return;
  }

  setMessage('');
  setError('');
  setPlanMessage('');
  setDeletingPlanId(plan.id);

  try {
    await apiRequest(
      `/api/memberships/plans/${plan.id}`,
      {
        method: 'DELETE',
      }
    );

    setPlans((current) =>
      current.filter(
        (currentPlan) => currentPlan.id !== plan.id
      )
    );

    if (String(planId) === String(plan.id)) {
      setPlanId('');
    }

    setMessage('Membership plan deleted successfully.');
  } catch (err) {
    setError(err.message);
  } finally {
    setDeletingPlanId(null);
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
      Assign monthly membership plans to companies and manage available
      membership plans.
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
                {plan.name} — {plan.monthly_hours} hours
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
      <h2>Create Membership Plan</h2>

      <form
        className="membership-form"
        onSubmit={handleCreatePlan}
      >
        <label>
          Plan name

          <input
            type="text"
            value={newPlan.name}
            onChange={(event) =>
              setNewPlan((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            placeholder="Example: Standard"
            disabled={creatingPlan}
            required
          />
        </label>

        <label>
          Monthly hours

          <input
            type="number"
            min="0"
            step="0.5"
            value={newPlan.monthly_hours}
            onChange={(event) =>
              setNewPlan((current) => ({
                ...current,
                monthly_hours: event.target.value,
              }))
            }
            placeholder="20"
            disabled={creatingPlan}
            required
          />
        </label>

        <label>
          Overage rate per hour

          <input
            type="number"
            min="0"
            step="0.01"
            value={newPlan.overage_rate}
            onChange={(event) =>
              setNewPlan((current) => ({
                ...current,
                overage_rate: event.target.value,
              }))
            }
            placeholder="25.00"
            disabled={creatingPlan}
            required
          />
        </label>

        <button
          type="submit"
          disabled={creatingPlan}
        >
          {creatingPlan
            ? 'Creating...'
            : 'Create Membership Plan'}
        </button>
        <div className="plan-actions">
  <button
    type="button"
    onClick={() => startEditingPlan(plan)}
    disabled={deletingPlanId === plan.id}
  >
    Edit Plan
  </button>

  <button
    type="button"
    onClick={() => handleDeletePlan(plan)}
    disabled={deletingPlanId === plan.id}
  >
    {deletingPlanId === plan.id
      ? 'Deleting...'
      : 'Delete Plan'}
  </button>
</div>

      </form>

      {planMessage && (
        <p className="success-message">
          {planMessage}
        </p>
      )}
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
              {editingPlanId === plan.id ? (
                <div className="plan-edit-form">
                  <label>
                    Plan name

                    <input
                      type="text"
                      value={editPlanName}
                      onChange={(event) =>
                        setEditPlanName(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Monthly hours

                    <input
                      type="number"
                      min="0"
                      value={editMonthlyHours}
                      onChange={(event) =>
                        setEditMonthlyHours(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Overage rate

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editOverageRate}
                      onChange={(event) =>
                        setEditOverageRate(event.target.value)
                      }
                    />
                  </label>

                  <div className="plan-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdatePlan(plan.id)
                      }
                    >
                      Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={stopEditingPlan}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{plan.name}</h3>

                  <p>
                    <strong>Monthly hours:</strong>{' '}
                    {plan.monthly_hours}
                  </p>

                  <p>
                    <strong>Overage rate:</strong> $
                    {plan.overage_rate} per hour
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      startEditingPlan(plan)
                    }
                  >
                    Edit Plan
                  </button>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  </main>
);
}

export default MembershipManagementPage;