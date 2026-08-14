import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the full access token to every request once the customer is logged in.
// The two-factor login endpoints attach their own (pre-auth) token manually.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('atm_access_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
