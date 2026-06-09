import api from './axios';
import { ENDPOINTS } from './endpoints';

export const authApi = {
  /**
   * Login — POST /api/v1/restpoint/auth/login
   * Backend returns: { success, accessToken, refreshToken, user, tenantId, tenantSlug }
   * Accepts both { email, password } and { identifier, password }
   */
  login: async ({ email, identifier, password }) => {
    // Use email if provided, otherwise use identifier (support both field names)
    const loginIdentifier = email || identifier;
    
    console.log('🔐 Login attempt with identifier:', loginIdentifier);
    
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, { 
      identifier: loginIdentifier, 
      password 
    });
    
    const data = response.data;

    if (data?.accessToken) {
      // Store token with consistent naming (authToken, not token)
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken || '');
      localStorage.setItem('user', JSON.stringify(data.user || {}));
      localStorage.setItem('tenantId', data.tenantId?.toString() || '');
      localStorage.setItem('tenantSlug', data.tenantSlug || '');
      
      // Set axios default header with tenant slug for all subsequent requests
      if (data.tenantSlug) {
        api.defaults.headers.common['x-tenant-slug'] = data.tenantSlug;
      }
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
      // swallow network errors on logout
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');  // Remove legacy key
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantId');
      localStorage.removeItem('tenantSlug');
      
      // Clear tenant header
      delete api.defaults.headers.common['x-tenant-slug'];
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
   */
  refresh: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });
    const data = response.data;
    if (data?.accessToken) {
      localStorage.setItem('authToken', data.accessToken);
      // Preserve tenant context during refresh
      if (data.tenantSlug) {
        api.defaults.headers.common['x-tenant-slug'] = data.tenantSlug;
      }
    }
    return data;
  },

  /**
   * Check auth status (passive — no error on 401) — GET /api/v1/restpoint/auth/status
   */
  checkStatus: async () => {
    try {
      const response = await api.get(ENDPOINTS.AUTH.STATUS);
      return response.data;
    } catch {
      return { authenticated: false };
    }
  },

  /**
   * Register new tenant — POST /api/v1/restpoint/tenants/register
   */
  register: async (tenantData) => {
    const response = await api.post(ENDPOINTS.TENANT.REGISTER, tenantData);
    return response.data;
  },
  
  /**
   * Initialize tenant session with slug
   */
  setTenantContext: (tenantSlug, tenantId) => {
    localStorage.setItem('tenantSlug', tenantSlug);
    localStorage.setItem('tenantId', tenantId?.toString() || '');
    api.defaults.headers.common['x-tenant-slug'] = tenantSlug;
  },
  
  /**
   * Get current tenant context
   */
  getTenantContext: () => {
    return {
      tenantSlug: localStorage.getItem('tenantSlug'),
      tenantId: localStorage.getItem('tenantId')
    };
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return !!token && token !== 'undefined' && token !== 'null';
  },
};