import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import CompanyCard from '../components/CompanyCard';

function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCompanies() {
      try {
        const data = await apiRequest('/api/admin/companies');
        setCompanies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, []);

  return (
    <main>
      <h1>Companies</h1>

      {loading && <p>Loading companies...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <div className="company-grid">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </main>
  );
}

export default CompaniesPage;