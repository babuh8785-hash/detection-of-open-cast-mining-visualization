import axios from 'axios';

// Resolves backend address dynamically (Requirement #5)
// Resolves to custom environment variable, or falls back to localhost if running inside local browser
const BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach security tokens from browser local storage dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Capture session timeouts (401 errors) and perform redirection
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Check if authorization failed and request hasn't been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect user to login only if they are not already on Auth screens
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
