import { useEffect, useState, useCallback } from 'react';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon, apiErrorMessage } from '../api/client';

const emptyForm = {
  code: '',
  description: '',
  discountType: 'flat',
  discountValue: '',
  maxDiscount: '',
  minFare: '',
  totalUsageLimit: '',
  appliesTo: 'rider',
  validTill: '',
};

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchCoupons();
      setCoupons(data.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        minFare: form.minFare ? Number(form.minFare) : 0,
        totalUsageLimit: form.totalUsageLimit ? Number(form.totalUsageLimit) : undefined,
      };
      await createCoupon(payload);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await updateCoupon(coupon._id, { isActive: !coupon.isActive });
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;
    try {
      await deleteCoupon(id);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="section-title">
        <h2>Promo codes</h2>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New coupon'}
        </button>
      </div>

      {error && <div className="error-text">{error}</div>}

      {showForm && (
        <form className="card" style={{ marginBottom: 20 }} onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field">
              <label>Code</label>
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="RIDE50" />
            </div>
            <div className="field">
              <label>Applies to</label>
              <select value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}>
                <option value="rider">Rider</option>
                <option value="captain">Captain</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="field">
              <label>Discount type</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="flat">Flat ₹</option>
                <option value="percentage">Percentage %</option>
              </select>
            </div>
            <div className="field">
              <label>Discount value</label>
              <input required type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
            </div>
            {form.discountType === 'percentage' && (
              <div className="field">
                <label>Max discount (₹, optional cap)</label>
                <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
              </div>
            )}
            <div className="field">
              <label>Minimum fare (₹)</label>
              <input type="number" value={form.minFare} onChange={(e) => setForm({ ...form, minFare: e.target.value })} />
            </div>
            <div className="field">
              <label>Total usage limit (optional)</label>
              <input type="number" value={form.totalUsageLimit} onChange={(e) => setForm({ ...form, totalUsageLimit: e.target.value })} />
            </div>
            <div className="field">
              <label>Valid till</label>
              <input required type="date" value={form.validTill} onChange={(e) => setForm({ ...form, validTill: e.target.value })} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Weekend promo for new riders" />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create coupon'}</button>
        </form>
      )}

      <div className="card">
        {loading ? (
          <div className="loading-row"><span className="spinner" /> Loading coupons…</div>
        ) : coupons.length === 0 ? (
          <div className="empty-state">No coupons yet. Create one to offer discounts.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Applies to</th>
                <th>Used</th>
                <th>Valid till</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.description}</span></td>
                  <td className="num">{c.discountType === 'flat' ? `₹${c.discountValue}` : `${c.discountValue}%`}</td>
                  <td style={{ textTransform: 'capitalize' }}>{c.appliesTo}</td>
                  <td className="num">{c.timesUsed}{c.totalUsageLimit ? ` / ${c.totalUsageLimit}` : ''}</td>
                  <td>{new Date(c.validTill).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${c.isActive ? 'success' : 'neutral'}`}>
                      <span className="badge-dot" />{c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => toggleActive(c)}>{c.isActive ? 'Disable' : 'Enable'}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(c._id)}>Delete</button>
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
