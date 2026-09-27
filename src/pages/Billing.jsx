import { useEffect, useState, useCallback } from 'react';
import { fetchBillingCycles, generateBilling, markBillingPaid, apiErrorMessage } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function Billing() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchBillingCycles();
      setCycles(data.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setMessage('');
    try {
      const { data } = await generateBilling();
      setMessage(data.message);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await markBillingPaid(id);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const totalDue = cycles.filter((c) => c.status === 'pending').reduce((sum, c) => sum + c.totalCommissionDue, 0);

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Statements generated</div>
          <div className="stat-value num">{cycles.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Commission pending collection</div>
          <div className="stat-value num">₹{totalDue.toFixed(0)}</div>
        </div>
      </div>

      <div className="section-title">
        <h2>Billing statements</h2>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating…' : 'Generate this cycle'}
        </button>
      </div>

      {message && <div style={{ fontSize: 13, color: 'var(--success)', marginBottom: 10 }}>{message}</div>}
      {error && <div className="error-text">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="loading-row"><span className="spinner" /> Loading statements…</div>
        ) : cycles.length === 0 ? (
          <div className="empty-state">
            No billing statements yet. Click "Generate this cycle" to roll up commission owed from completed rides in the last billing period.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Captain</th>
                <th>Period</th>
                <th>Rides</th>
                <th>Fare collected</th>
                <th>Commission due</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c) => (
                <tr key={c._id}>
                  <td>{c.captain?.fullName || '—'}<br /><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.captain?.empId}</span></td>
                  <td>{new Date(c.periodStart).toLocaleDateString()} – {new Date(c.periodEnd).toLocaleDateString()}</td>
                  <td className="num">{c.totalRides}</td>
                  <td className="num">₹{c.totalFareCollected.toFixed(0)}</td>
                  <td className="num">₹{c.totalCommissionDue.toFixed(0)}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    {c.status === 'pending' && (
                      <button className="btn btn-sm btn-success" onClick={() => handleMarkPaid(c._id)}>Mark paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
