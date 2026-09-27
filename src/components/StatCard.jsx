export default function StatCard({ label, value, suffix }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value num">
        {value}
        {suffix ? <small> {suffix}</small> : null}
      </div>
    </div>
  );
}
