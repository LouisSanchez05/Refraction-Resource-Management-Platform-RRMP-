import { useState } from 'react';
import { apiRequest } from '../services/api';
import { Link } from 'react-router-dom';

function CompanyCard({
  company,
  onCompanyUpdated,
  onCompanyDeleted,
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(company.name);
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isOverLimit = Number(company.overage_hours) > 0;
  const hasMembership = Boolean(company.plan_id);

  async function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setMessage('Company name is required.');
      return;
    }

    setMessage('');

    try {
      const updatedCompany = await apiRequest(
        `/api/companies/${company.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      onCompanyUpdated(updatedCompany);
      setEditing(false);
      setMessage('Company updated.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${company.name}"?\n\n` +
        'This may also delete the company’s membership and reservation records. ' +
        'This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    setMessage('');
    setDeleting(true);

    try {
      await apiRequest(
        `/api/admin/companies/${company.id}`,
        {
          method: 'DELETE',
        }
      );

      onCompanyDeleted(company.id);
    } catch (err) {
      setMessage(err.message);
      setDeleting(false);
    }
  }

  function handleCancelEdit() {
    setName(company.name);
    setMessage('');
    setEditing(false);
  }

  return (
    <article className="company-card">
      {editing ? (
        <>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={deleting}
          />

          <div className="company-actions">
            <button
              type="button"
              onClick={handleSave}
              disabled={deleting}
            >
              Save
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={deleting}
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

          <div className="company-actions">
            <Link to={`/companies/${company.id}`}>
              View Company Details
            </Link>

            <button
              type="button"
              onClick={() => {
                setMessage('');
                setEditing(true);
              }}
              disabled={deleting}
            >
              Edit Company
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? 'Deleting...'
                : 'Delete Company'}
            </button>
          </div>
        </>
      )}

      {message && <p>{message}</p>}
    </article>
  );
}

export default CompanyCard;