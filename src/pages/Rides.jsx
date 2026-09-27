import { useEffect, useState, useCallback } from 'react';
import { fetchRides, apiErrorMessage } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'requested', label: 'Requested' },
  { key: 'cancelled_by_rider', label: 'Cancelled (rider)' },
  { key: 'cancelled_by_captain', label: 'Cancelled (captain)' },
  { key: 'no_captain_found', label: 'No captain found' },
];

export default function Rides() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [rides, setRides] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchRides({ status: status || undefined, page, limit });
      setRides(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [status]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div>
      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-pill${status === f.key ? ' active' : ''}`}
            onClick={() => setStatus(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-row"><span className="spinner" /> Loading rides…</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : rides.length === 0 ? (
          <div className="empty-state">No rides found for this filter.</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Rider</th>
                  <th>Captain</th>
                  <th>Distance</th>
                  <th>Fare</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>{r.rider?.fullName || '—'}<br /><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.rider?.phone}</span></td>
                    <td>{r.captain?.fullName || '—'}<br /><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.captain?.empId}</span></td>
                    <td className="num">{r.distanceKm} km</td>
                    <td className="num">₹{r.fare?.total}</td>
                    <td className="num">{r.commission ? `₹${r.commission}` : '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                Page {page} of {totalPages} · {total} rides
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
