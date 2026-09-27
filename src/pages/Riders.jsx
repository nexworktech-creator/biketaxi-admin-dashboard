import { useEffect, useState } from 'react';
import { fetchRiders, apiErrorMessage } from '../api/client';

export default function Riders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchRiders({ limit: 50 });
        setRiders(data.data);
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="card">
      {loading ? (
        <div className="loading-row"><span className="spinner" /> Loading riders…</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : riders.length === 0 ? (
        <div className="empty-state">No riders registered yet.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Total rides</th>
              <th>Total spent</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {riders.map((r) => (
              <tr key={r._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar-circle">{r.fullName?.[0]?.toUpperCase()}</div>
                    {r.fullName}
                  </div>
                </td>
                <td>{r.phone}</td>
                <td>{r.city}</td>
                <td className="num">{r.totalRides}</td>
                <td className="num">₹{r.totalSpent}</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
