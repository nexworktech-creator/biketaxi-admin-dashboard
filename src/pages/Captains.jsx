import { useEffect, useState, useCallback } from 'react';
import {
  fetchCaptains,
  fetchCaptainDetail,
  approveCaptain,
  rejectCaptain,
  suspendCaptain,
  apiErrorMessage,
  fileUrl,
} from '../api/client';
import StatusBadge from '../components/StatusBadge';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'under_processing', label: 'Under review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'suspended', label: 'Suspended' },
];

export default function Captains() {
  const [status, setStatus] = useState('under_processing');
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchCaptains(status ? { status } : {});
      setCaptains(data.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

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
          <div className="loading-row"><span className="spinner" /> Loading captains…</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : captains.length === 0 ? (
          <div className="empty-state">No captains in this category.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>City</th>
                <th>Emp ID</th>
                <th>Status</th>
                <th>Applied</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {captains.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar-circle">{c.fullName?.[0]?.toUpperCase()}</div>
                      {c.fullName}
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.address?.city}</td>
                  <td>{c.empId || '—'}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => setSelectedId(c._id)}>Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedId && (
        <CaptainDetailModal
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => { setSelectedId(null); load(); }}
        />
      )}
    </div>
  );
}

function CaptainDetailModal({ id, onClose, onChanged }) {
  const [captain, setCaptain] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchCaptainDetail(id);
        setCaptain(data.data);
      } catch (err) {
        setError(apiErrorMessage(err));
      }
    })();
  }, [id]);

  const handleApprove = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await approveCaptain(id);
      setCredentials(data.credentials);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    setError('');
    try {
      await rejectCaptain(id, rejectReason);
      onChanged();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSuspend = async () => {
    setBusy(true);
    try {
      await suspendCaptain(id);
      onChanged();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{captain?.fullName || 'Loading…'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-text">{error}</div>}

        {!captain ? (
          <div className="loading-row"><span className="spinner" /> Loading…</div>
        ) : credentials ? (
          <div>
            <p>Captain approved. Share these login credentials with them:</p>
            <div className="credentials-box">
              <div className="kv-row"><span className="kv-key">Emp ID</span><span className="num">{credentials.empId}</span></div>
              <div className="kv-row"><span className="kv-key">Password</span><span className="num">{credentials.password}</span></div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onChanged}>Done</button>
          </div>
        ) : (
          <div>
            <div className="kv-row"><span className="kv-key">Status</span><StatusBadge status={captain.status} /></div>
            <div className="kv-row"><span className="kv-key">Phone</span><span>{captain.phone}</span></div>
            <div className="kv-row"><span className="kv-key">Email</span><span>{captain.email || '—'}</span></div>
            <div className="kv-row"><span className="kv-key">Date of birth</span><span>{new Date(captain.dateOfBirth).toLocaleDateString()}</span></div>
            <div className="kv-row"><span className="kv-key">Address</span><span>{captain.address?.line1}, {captain.address?.city}</span></div>
            <div className="kv-row"><span className="kv-key">ID number</span><span>{captain.identityDocument?.number}</span></div>
            <div className="kv-row"><span className="kv-key">UPI ID</span><span>{captain.paymentDetails?.upiId}</span></div>
            <div className="kv-row"><span className="kv-key">Vehicle</span><span>{captain.vehicle?.type} {captain.vehicle?.number}</span></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              <div>
                <div className="stat-label">ID front</div>
                <img className="doc-thumb" src={fileUrl(captain.identityDocument?.frontPhoto)} alt="ID front" />
              </div>
              <div>
                <div className="stat-label">ID back</div>
                <img className="doc-thumb" src={fileUrl(captain.identityDocument?.backPhoto)} alt="ID back" />
              </div>
              <div>
                <div className="stat-label">Payment QR</div>
                <img className="doc-thumb" src={fileUrl(captain.paymentDetails?.qrCodeImage)} alt="QR code" />
              </div>
              {captain.profilePicture && (
                <div>
                  <div className="stat-label">Profile photo</div>
                  <img className="doc-thumb" src={fileUrl(captain.profilePicture)} alt="Profile" />
                </div>
              )}
            </div>

            {showRejectForm ? (
              <div style={{ marginTop: 18 }}>
                <div className="field">
                  <label>Rejection reason</label>
                  <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-danger" disabled={busy} onClick={handleReject}>Confirm reject</button>
                  <button className="btn" onClick={() => setShowRejectForm(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                {captain.status === 'under_processing' && (
                  <>
                    <button className="btn btn-success" disabled={busy} onClick={handleApprove}>Approve & issue Emp ID</button>
                    <button className="btn btn-danger" disabled={busy} onClick={() => setShowRejectForm(true)}>Reject</button>
                  </>
                )}
                {captain.status === 'approved' && (
                  <button className="btn btn-danger" disabled={busy} onClick={handleSuspend}>Suspend account</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
