import api from './axios';
import { ENDPOINTS } from './endpoints';
import useAuthStore from '../store/useAuthStore';

// ─── Shared Auth API ──────────────────────────────────────────
// Uses httpOnly cookies for refresh tokens (via withCredentials)
// Uses sessionStorage for access tokens (cleared on tab close)
// Tokens auto-refresh every 10 minutes

export const authApi = {
  /**
   * Login — POST /api/v1/restpoint/auth/login
   * Backend should set httpOnly cookie with refresh token
   * Returns: { success, accessToken, user, tenantId, tenantSlug }
   */
  login: async ({ email, identifier, password }) => {
    const loginIdentifier = email || identifier;

    const response = await api.post(ENDPOINTS.AUTH.LOGIN, {
      identifier: loginIdentifier,
      password
    });

    const data = response.data;

    if (data?.accessToken) {
      // Use sessionStorage only (cleared when browser tab closes)
      sessionStorage.setItem('authToken', data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(data.user || {}));

      // Non-sensitive metadata in localStorage
      if (data.tenant?.tenantSlug) localStorage.setItem('tenantSlug', data.tenant.tenantSlug);
      if (data.tenant?.tenantId) localStorage.setItem('tenantId', data.tenant.tenantId.toString());
      if (data.tenant?.dbName || data.user?.dbName) localStorage.setItem('dbName', data.user?.dbName || data.tenant.dbName);

      // Start auto-refresh via the axios module
      const { startTokenRefresh } = await import('./axios');
      startTokenRefresh();

      // Update zustand store
      useAuthStore.getState().login(data.user, data.accessToken);
    }
    return data;
  },

  /**
   * Logout — POST /api/v1/restpoint/auth/logout
   */
  logout: async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (_) {
      // Swallow network errors on logout
    } finally {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      localStorage.removeItem('tenantSlug');
      localStorage.removeItem('tenantId');
      localStorage.removeItem('dbName');

      // Stop auto-refresh
      const { stopTokenRefresh } = await import('./axios');
      stopTokenRefresh();

      // Update store
      useAuthStore.getState().logout();
    }
    return { success: true };
  },

  /**
   * Get current authenticated user — GET /api/v1/restpoint/auth/me
   */
  getMe: async () => {
    const response = await api.get(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Refresh access token — POST /api/v1/restpoint/auth/refresh
   * Uses httpOnly cookie (sent automatically via withCredentials)
   */
  refresh: async () => {
    const response = await api.post(ENDPOINTS.AUTH.REFRESH, {});
    const data = response.data;
    if (data?.accessToken) {
      sessionStorage.setItem('authToken', data.accessToken);
    }
    return data;
  },

  /**
   * Register new tenant — POST /api/v1/restpoint/tenants/register
   */
  register: async (tenantData) => {
    const response = await api.post(ENDPOINTS.TENANT.REGISTER, tenantData);
    return response.data;
  },

  /**
   * Get auth headers for external service calls
   */
  getAuthHeaders: () => {
    const token = sessionStorage.getItem('authToken');
    const slug = localStorage.getItem('tenantSlug');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (slug) headers['x-tenant-slug'] = slug;
    return headers;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = sessionStorage.getItem('authToken');
    return !!token && token !== 'undefined' && token !== 'null';
  },

  /**
   * Portal Login — POST /api/v1/restpoint/portal/login
   */
  portalLogin: async ({ phone }) => {
    const previousTenantSlug = api.defaults.headers.common['x-tenant-slug'];
    delete api.defaults.headers.common['x-tenant-slug'];

    try {
      const response = await api.post(ENDPOINTS.PORTAL.LOGIN, {
        phone: phone.trim()
      });
      const data = response.data;

      if (data?.success && data?.tenantSlug) {
        sessionStorage.setItem('sessionToken', data.sessionToken || data.session_token);
        localStorage.setItem('tenantSlug', data.tenantSlug);
        if (data.deceased) {
          sessionStorage.setItem('deceased', JSON.stringify(data.deceased));
          sessionStorage.setItem('deceasedId', data.deceased.deceased_id);
        }
        api.defaults.headers.common['x-tenant-slug'] = data.tenantSlug;
      }
      return data;
    } catch (error) {
      if (previousTenantSlug) {
        api.defaults.headers.common['x-tenant-slug'] = previousTenantSlug;
      }
      throw error;
    }
  },

  portalLogout: () => {
    sessionStorage.removeItem('sessionToken');
    sessionStorage.removeItem('deceased');
    sessionStorage.removeItem('deceasedId');
    delete api.defaults.headers.common['x-tenant-slug'];
    return { success: true };
  },

  getPortalDeceased: async (deceasedId, tenantSlug) => {
    api.defaults.headers.common['x-tenant-slug'] = tenantSlug;
    const response = await api.get(`${ENDPOINTS.PORTAL.DECEASED}/${deceasedId}`);
    return response.data;
  },

  getTenantContext: () => ({
    tenantSlug: localStorage.getItem('tenantSlug'),
    tenantId: localStorage.getItem('tenantId')
  }),
};

export default authApi;