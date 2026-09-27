const STATUS_MAP = {
  // captain application statuses
  under_processing: { label: 'Under review', tone: 'warn' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  suspended: { label: 'Suspended', tone: 'danger' },

  // ride statuses
  requested: { label: 'Requested', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'info' },
  arrived: { label: 'Captain arrived', tone: 'info' },
  ongoing: { label: 'Ongoing', tone: 'warn' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled_by_rider: { label: 'Cancelled (rider)', tone: 'danger' },
  cancelled_by_captain: { label: 'Cancelled (captain)', tone: 'danger' },
  no_captain_found: { label: 'No captain found', tone: 'neutral' },

  // billing
  pending: { label: 'Pending', tone: 'warn' },
  paid: { label: 'Paid', tone: 'success' },
};

export default function StatusBadge({ status }) {
  const info = STATUS_MAP[status] || { label: status, tone: 'neutral' };
  return (
    <span className={`badge badge-${info.tone}`}>
      <span className="badge-dot" />
      {info.label}
    </span>
  );
}
