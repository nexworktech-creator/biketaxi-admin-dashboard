import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchOverview, fetchRides, apiErrorMessage } from '../api/client';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const CHART_COLORS = ['#1f9d55', '#f5a623', '#2f6fed', '#e5484d', '#6b6f76'];

export default function Overview() {
  const [overview, setOverview] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ov, rides] = await Promise.all([fetchOverview(), fetchRides({ limit: 6 })]);
        setOverview(ov.data.data);
        setRecentRides(rides.data.data);
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="loading-row"><span className="spinner" /> Loading overview…</div>;
  if (error) return <div className="empty-state">{error}</div>;

  const chartData = [
    { name: 'Completed', value: overview.completedRides },
    { name: 'Other', value: Math.max(overview.totalRides - overview.completedRides, 0) },
  ];

  return (
    <div>
      <div className="stat-grid">
        <StatCard label="Active captains right now" value={overview.activeCaptainsNow} />
        <StatCard label="Approved captains" value={overview.totalCaptains} />
        <StatCard label="Pending approvals" value={overview.pendingApprovals} />
        <StatCard label="Registered riders" value={overview.totalRiders} />
        <StatCard label="Total rides" value={overview.totalRides} />
        <StatCard label="Completed rides" value={overview.completedRides} />
        <StatCard label="Fare collected" value={`₹${overview.totalFareCollected.toFixed(0)}`} />
        <StatCard label="Commission earned" value={`₹${overview.totalCommissionEarned.toFixed(0)}`} />
        <StatCard label="Distance covered" value={overview.totalDistanceKm.toFixed(0)} suffix="km" />
      </div>

      <div className="two-col">
        <div className="card">
          <div className="section-title">
            <h2>Recent rides</h2>
          </div>
          {recentRides.length === 0 ? (
            <div className="empty-state">No rides yet.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rider</th>
                  <th>Captain</th>
                  <th>Fare</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map((r) => (
                  <tr key={r._id}>
                    <td>{r.rider?.fullName || '—'}</td>
                    <td>{r.captain?.fullName || '—'}</td>
                    <td className="num">₹{r.fare?.total}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Ride completion</h2>
          </div>
          {overview.totalRides === 0 ? (
            <div className="empty-state">No ride data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {chartData.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
