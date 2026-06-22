import axios from 'axios';
import { ENDPOINTS } from './endpoints';
import env from '../config/env';

// Create axios instance with centralized API URL
const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: env.API_TIMEOUT,
});

// Request interceptor - adds auth token and tenant headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Attach tenant slug for multi-tenant isolation
  const tenantSlug = localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug');
  const tenantId = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id');
  
  if (tenantSlug) config.headers['x-tenant-slug'] = tenantSlug;
  if (tenantId) config.headers['x-tenant-id'] = tenantId;
  
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return Promise.reject(error);
        
        const response = await axios.post(env.API_URL + ENDPOINTS.AUTH.REFRESH, 
          { token: refreshToken }, 
          { withCredentials: true }
        );
        
        const newToken = response.data?.token || response.data?.accessToken;
        if (newToken) {
          localStorage.setItem('authToken', newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;