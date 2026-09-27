import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

/** Pulls a readable message out of an API error response. */
export function apiErrorMessage(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}

// ---------- Admin auth ----------
export const loginAdmin = (username, password) => client.post('/admin/login', { username, password });

// ---------- Captains ----------
export const fetchCaptains = (params) => client.get('/admin/captains', { params });
export const fetchCaptainDetail = (id) => client.get(`/admin/captains/${id}`);
export const approveCaptain = (id) => client.patch(`/admin/captains/${id}/approve`);
export const rejectCaptain = (id, reason) => client.patch(`/admin/captains/${id}/reject`, { reason });
export const suspendCaptain = (id) => client.patch(`/admin/captains/${id}/suspend`);
export const fetchLiveCaptains = () => client.get('/admin/captains/live');

// ---------- Analytics / rides / riders ----------
export const fetchOverview = () => client.get('/admin/analytics/overview');
export const fetchRides = (params) => client.get('/admin/rides', { params });
export const fetchRiders = (params) => client.get('/admin/riders', { params });

// ---------- Coupons ----------
export const fetchCoupons = () => client.get('/admin/coupons');
export const createCoupon = (payload) => client.post('/admin/coupons', payload);
export const updateCoupon = (id, payload) => client.patch(`/admin/coupons/${id}`, payload);
export const deleteCoupon = (id) => client.delete(`/admin/coupons/${id}`);

// ---------- Billing ----------
export const generateBilling = () => client.post('/admin/billing/generate');
export const fetchBillingCycles = (params) => client.get('/admin/billing', { params });
export const markBillingPaid = (id) => client.patch(`/admin/billing/${id}/mark-paid`);

export const fileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  const normalized = path.replace(/\\/g, '/').replace(/^.*uploads\//, 'uploads/');
  return `${origin}/${normalized}`;
};
