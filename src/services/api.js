import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Items ─────────────────────────────────────────────────────────────────
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  updateStatus: (id, status) => api.patch(`/items/${id}/status`, { status }),
  claim: (id) => api.post(`/items/${id}/claim`),
  delete: (id) => api.delete(`/items/${id}`),
  getMyItems: (params) => api.get('/items/my', { params }),
  getMyClaimedItems: (params) => api.get('/items/my/claimed', { params }),
  getCategories: () => api.get('/items/categories'),
  getStats: () => api.get('/items/stats'),
};

export default api;
