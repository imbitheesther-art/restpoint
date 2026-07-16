import axios from 'axios';
import { ENDPOINTS } from './endpoints';
import env from '../config/env';

// Workshop service axios instance
export const workshopApi = axios.create({
  baseURL: env.WORKSHOP_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: env.API_TIMEOUT,
});

workshopApi.interceptors.request.use((config) => {
  const slug = localStorage.getItem('tenantSlug');
  // Check BOTH localStorage and sessionStorage for auth token
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  if (slug) config.headers['x-tenant-slug'] = slug;
  return config;
}, (error) => Promise.reject(error));

// ─── Shared Auth Token (single source of truth) ──────────────────────────
// Uses localStorage (primary) with sessionStorage as fallback
// Auto-refreshes every 10 minutes

let cachedToken = null;
let cachedSlug = null;
let refreshIntervalId = null;
let isRefreshing = false; // Prevent concurrent refresh calls

const getToken = () => cachedToken || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
const setToken = (token) => {
  cachedToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
    sessionStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }
};

/** Get refresh token from sessionStorage first (where authApi stores it), fallback to localStorage */
const getRefreshToken = () => sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');

/** Store refresh token in both storages for consistency */
const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem('refreshToken', token);
    sessionStorage.setItem('refreshToken', token);
  } else {
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('refreshToken');
  }
};

const getSlug = () => cachedSlug || localStorage.getItem('tenantSlug');

// ─── Token Refresh (every 10 minutes) ────────────────────────────────────
export const startTokenRefresh = () => {
  // Guard: don't start multiple intervals
  if (refreshIntervalId) {
    console.log('[Auth] Token refresh already running, skipping duplicate start');
    return;
  }

  refreshIntervalId = setInterval(async () => {
    // Guard: prevent concurrent refresh calls
    if (isRefreshing) {
      console.log('[Auth] Refresh already in progress, skipping');
      return;
    }

    isRefreshing = true;
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.warn('[Auth] No refresh token available');
        return;
      }

      const response = await axios.post(
        env.FULL_API_URL + ENDPOINTS.AUTH.REFRESH,
        { refreshToken },
        { withCredentials: true }
      );
      const newToken = response.data?.token || response.data?.accessToken;
      if (newToken) {
        setToken(newToken);
        console.log('[Auth] Token refreshed successfully');
      }
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error.message);
      // If refresh fails, try once more in 30s then force logout
      if (error.response?.status === 401) {
        setTimeout(async () => {
          try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              forceLogout();
              return;
            }
            const retry = await axios.post(
              env.FULL_API_URL + ENDPOINTS.AUTH.REFRESH,
              { refreshToken },
              { withCredentials: true }
            );
            if (retry.data?.token || retry.data?.accessToken) {
              setToken(retry.data.token || retry.data.accessToken);
              return;
            }
          } catch {
            // Force logout
            forceLogout();
          }
        }, 30000);
      }
    } finally {
      isRefreshing = false;
    }
  }, 600000); // Every 10 minutes (600,000ms)
};

export const stopTokenRefresh = () => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
};

const forceLogout = () => {
  setToken(null);
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('tenantId');
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    Object.keys(user).forEach(key => sessionStorage.removeItem(key));
  } catch { }
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  // Preserve tenantSlug so we don't redirect to 'default'
  // window.location.href = '/login';
};

// ─── Main Axios Instance ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: env.FULL_API_URL,
  withCredentials: true, // CRITICAL: sends httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: env.API_TIMEOUT,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = getToken();
  const slug = getSlug();
  const tenantId = localStorage.getItem('tenantId');

  // Get user ID
  let userId = null;
  try {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      userId = user.id || user.userId;
    }
  } catch { }

  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  if (slug) config.headers['x-tenant-slug'] = slug;
  if (tenantId) config.headers['x-tenant-id'] = tenantId;
  if (userId) config.headers['x-user-id'] = userId.toString();

  return config;
}, (error) => Promise.reject(error));

// Response interceptor with auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try refresh using refresh token from sessionStorage first, fallback to localStorage
        const refreshToken = getRefreshToken();
        const response = await axios.post(
          env.FULL_API_URL + ENDPOINTS.AUTH.REFRESH,
          { refreshToken },
          { withCredentials: true }
        );
        const newToken = response.data?.token || response.data?.accessToken;
        if (newToken) {
          setToken(newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - force logout
        forceLogout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Export forceLogout for use in auth store
export { forceLogout };
export default api;