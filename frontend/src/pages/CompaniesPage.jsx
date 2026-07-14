import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import CompanyCard from '../components/CompanyCard';


function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [message, setMessage] = useState('');

  async function handleCreateCompany(event) {
  event.preventDefault();
  setMessage('');

  try {
    const newCompany = await apiRequest('/api/admin/companies', {
      method: 'POST',
      body: JSON.stringify({
        name: newCompanyName,
      }),
    });

    setCompanies((current) => [...current, newCompany]);
    setNewCompanyName('');
    setMessage('Company created successfully.');
  } catch (err) {
    setMessage(err.message);
  }
}

  useEffect(() => {
    async function loadCompanies() {
      try {
        const data = await apiRequest('/api/admin/companies?month=7&year=2026');
        setCompanies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, []);

  function handleCompanyUpdated(updatedCompany) {
  setCompanies((current) =>
    current.map((company) =>
      company.id === updatedCompany.id
        ? { ...company, ...updatedCompany }
        : company
    )
  );
}

  return (
    <main>
      <h1>Companies</h1>

      {loading && <p>Loading companies...</p>}
      {error && <p>Error: {error}</p>}
      <section className="company-form-section">
      <h2>Create Company</h2>

      <form onSubmit={handleCreateCompany}>
        <input
          type="text"
          value={newCompanyName}
          onChange={(event) =>
            setNewCompanyName(event.target.value)
          }
          placeholder="Company name"
          required
        />

        <button type="submit">
          Create Company
        </button>
      </form>

      {message && <p>{message}</p>}
    </section>
      {!loading && !error && (
        <div className="company-grid">
          {companies.map((company) => (
            <CompanyCard
            key={company.id}
            company={company}
            onCompanyUpdated={handleCompanyUpdated}
          />
          ))}
        </div>
      )}
    </main>
  );
}

export default CompaniesPage;