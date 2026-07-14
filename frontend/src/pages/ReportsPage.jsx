import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

function ReportsPage() {
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [overages, setOverages] = useState([]);
  const [roomUtilization, setRoomUtilization] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function loadReports() {
      try {
        const [monthlyData, overageData, roomData] = await Promise.all([
        apiRequest(
          `/api/memberships/monthly-report?month=${month}&year=${year}`
        ),
        apiRequest(
          `/api/memberships/overages?month=${month}&year=${year}`
        ),
        apiRequest(
          `/api/reports/room-utilization?month=${month}&year=${year}`
        ),
      ]);

        setMonthlyReport(monthlyData);
        setOverages(overageData);
        setRoomUtilization(roomData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [month, year]);

  if (loading) {
    return (
      <main>
        <p>Loading reports...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Reports</h1>

      {error && <p>Error: {error}</p>}

      <section className="report-section">
        <h2>Monthly Usage</h2>

        {monthlyReport.length === 0 ? (
          <p>No monthly usage data found.</p>
        ) : (
          <div className="report-grid">
            {monthlyReport.map((item) => (
              <article
                className="report-card"
                key={`${item.company_id}-${item.month}-${item.year}`}
              >
                <h3>{item.company_name}</h3>
                <p><strong>Plan:</strong> {item.plan_name}</p>
                <p><strong>Used:</strong> {item.hours_used}</p>
                <p>
                  <strong>Remaining:</strong>{' '}
                  {item.remaining_hours}
                </p>
                <p>
                  <strong>Overage:</strong>{' '}
                  {item.overage_hours}
                </p>
                <p>
                  <strong>Overage cost:</strong> $
                  {item.overage_cost}
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
          onChange={(event) => setMonth(event.target.value)}
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
          onChange={(event) => setYear(event.target.value)}
        />
      </label>
    </section>

      <section className="report-section">
        <h2>Companies With Overages</h2>

        {overages.length === 0 ? (
          <p>No companies currently have overages.</p>
        ) : (
          <div className="report-grid">
            {overages.map((item) => (
              <article
                className="report-card"
                key={item.company_id}
              >
                <h3>{item.company_name}</h3>
                <p>
                  <strong>Overage hours:</strong>{' '}
                  {item.overage_hours}
                </p>
                <p>
                  <strong>Overage cost:</strong> $
                  {item.overage_cost}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="report-section">
        <h2>Room Utilization</h2>

        {roomUtilization.length === 0 ? (
          <p>No room utilization data found.</p>
        ) : (
          <div className="report-grid">
            {roomUtilization.map((room) => (
              <article
                className="report-card"
                key={room.room_id}
              >
                <h3>{room.room_name}</h3>
                <p><strong>Type:</strong> {room.room_type}</p>
                <p>
                  <strong>Total bookings:</strong>{' '}
                  {room.total_bookings}
                </p>
                <p>
                  <strong>Total hours:</strong>{' '}
                  {room.total_hours_booked}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ReportsPage;