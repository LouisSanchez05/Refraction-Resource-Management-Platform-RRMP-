function CompanyCard({ company }) {
  return (
    <article className="company-card">
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
    </article>
  );
}

export default CompanyCard;