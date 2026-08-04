import axios from 'axios';

// All API calls go to Express backend
// Local: Vite proxy forwards /api → http://localhost:3001/api
// Production (Cloud): VITE_API_URL points to the live backend URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────
// Automatically attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('titan_access_token') ||
                  localStorage.getItem('titan_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────
// Handle expired tokens globally — redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.code;
      if (code === 'TOKEN_EXPIRED' || code === 'UNAUTHORIZED') {
        // Clear stored tokens
        sessionStorage.removeItem('titan_access_token');
        localStorage.removeItem('titan_access_token');
        localStorage.removeItem('titan_sdmms_user');
        // Force page reload to show login screen
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
