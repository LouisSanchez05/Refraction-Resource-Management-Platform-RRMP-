import { useState } from 'react';
import { apiRequest } from '../services/api';
import { Link } from 'react-router-dom';

function CompanyCard({ company, onCompanyUpdated }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(company.name);
  const [message, setMessage] = useState('');
  const isOverLimit = Number(company.overage_hours) > 0;
  const hasMembership = Boolean(company.plan_id);

  async function handleSave() {
    setMessage('');

    try {
      const updatedCompany = await apiRequest(
        `/api/companies/${company.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ name }),
        }
      );

      onCompanyUpdated(updatedCompany);
      setEditing(false);
      setMessage('Company updated.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    
    <article className="company-card">
      {editing ? (
        <>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <div className="company-actions">
            <button type="button" onClick={handleSave}>
              Save
            </button>

            <button
              type="button"
              onClick={() => {
                setName(company.name);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>{company.name}</h3>

          <p>
            <strong>Membership plan:</strong>{' '}
            {company.membership_plan || 'Not assigned'}
          </p>

          <p>
            <strong>Monthly hours:</strong>{' '}
            {company.monthly_hours ?? 'N/A'}
          </p>

          <p>
            <strong>Overage rate:</strong>{' '}
            {company.overage_rate ?? 'N/A'}
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
        <p>

        <strong>Status:</strong>{' '}
        {!hasMembership
          ? 'No membership assigned'
          : isOverLimit
            ? 'Over limit'
            : 'Within limit'}
</p>

      <Link to={`/companies/${company.id}`}>
        View Company Details
      </Link>

          <button
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit Company
          </button>
        </>
      )}

      {message && <p>{message}</p>}
    </article>
  );
}

export default CompanyCard;