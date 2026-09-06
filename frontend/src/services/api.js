import axios from 'axios';

const API_BASE = '/api';

// Attach active user ID from localStorage if available
axios.interceptors.request.use((config) => {
  try {
    const savedUser = localStorage.getItem('sevasetu_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user?.id) {
        config.headers['x-user-id'] = user.id;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return config;
});

export const api = {
  // Authentication & Users
  login: (credentials) => axios.post(`${API_BASE}/auth/login`, credentials),
  register: (data) => axios.post(`${API_BASE}/auth/register`, data),
  verifyOtp: (phone, otp) => axios.post(`${API_BASE}/auth/verify-otp`, { phone, otp }),
  getMe: () => axios.get(`${API_BASE}/auth/me`),

  // Platform Super Admin
  getPlatformOverview: () => axios.get(`${API_BASE}/admin/platform/overview`),
  getPlatformSocieties: () => axios.get(`${API_BASE}/admin/platform/societies`),
  registerSociety: (data) => axios.post(`${API_BASE}/admin/platform/societies`, data),
  updateSocietyApproval: (id, status) => axios.patch(`${API_BASE}/admin/platform/societies/${id}/status`, { status }),
  getPlatformWorkers: () => axios.get(`${API_BASE}/admin/platform/workers`),
  getPlatformCustomers: () => axios.get(`${API_BASE}/admin/platform/customers`),

  // Cooperative Societies & Society Admin Dashboard
  getSocieties: () => axios.get(`${API_BASE}/societies`),
  getSocietyById: (id) => axios.get(`${API_BASE}/societies/${id}`),
  getSocietyDashboard: (id) => axios.get(`${API_BASE}/societies/${id}/dashboard`),

  // Workers
  getWorkers: (params) => axios.get(`${API_BASE}/workers`, { params }),
  getWorkerById: (id) => axios.get(`${API_BASE}/workers/${id}`),
  registerWorker: (data) => axios.post(`${API_BASE}/workers`, data),
  verifyWorker: (id, status) => axios.patch(`${API_BASE}/workers/${id}/verify`, { status }),

  // Customers
  getCustomers: () => axios.get(`${API_BASE}/customers`),
  getCustomerById: (id) => axios.get(`${API_BASE}/customers/${id}`),
  registerCustomer: (data) => axios.post(`${API_BASE}/customers`, data),

  // Bookings
  getBookings: (params) => axios.get(`${API_BASE}/bookings`, { params }),
  getBookingById: (id) => axios.get(`${API_BASE}/bookings/${id}`),
  createBooking: (data) => axios.post(`${API_BASE}/bookings`, data),
  updateBookingStatus: (id, status) => axios.patch(`${API_BASE}/bookings/${id}/status`, { status }),

  // Community Posts (Bidirectional)
  getPosts: (params) => axios.get(`${API_BASE}/posts`, { params }),
  getPostById: (id) => axios.get(`${API_BASE}/posts/${id}`),
  createPost: (data) => axios.post(`${API_BASE}/posts`, data),
  applyToPost: (postId, workerId, message) => axios.post(`${API_BASE}/posts/${postId}/apply`, { worker_id: workerId, message }),

  // AI Demand Forecasting
  getForecast: (district, month, year) => axios.get(`${API_BASE}/forecast`, { params: { district, month, year } }),
  getForecastHistory: (district) => axios.get(`${API_BASE}/forecast/history`, { params: { district } }),

  // Admin Tools (Database Reseed without touching user sessions)
  reseedDatabase: () => axios.post(`${API_BASE}/admin/reseed`)
};

export default api;
