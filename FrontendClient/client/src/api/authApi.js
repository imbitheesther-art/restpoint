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
   * Get auth headers for external service calls (e.g., call-service)
   */
  getAuthHeaders: () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const slug = localStorage.getItem('tenantSlug');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (slug) {
      headers['x-tenant-slug'] = slug;
    }
    return headers;
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return !!token && token !== 'undefined' && token !== 'null';
  },

  /**
   * Portal Login — POST /api/v1/restpoint/portal/login
   * Accepts phone number of next of kin
   * Returns: { success, sessionToken, tenantSlug, deceased }
   * 
   * The backend will:
   * 1. Search all tenants for a deceased with next of kin matching this phone
   * 2. Return the tenant slug and deceased info
   * 3. Create a session token for portal access
   */
  portalLogin: async ({ phone }) => {
    // Remove tenant slug header for portal login (we need to discover the tenant)
    const previousTenantSlug = api.defaults.headers.common['x-tenant-slug'];
    delete api.defaults.headers.common['x-tenant-slug'];
    
    try {
      const response = await api.post(ENDPOINTS.PORTAL.LOGIN, { 
        phone: phone.trim()
      });
      
      const data = response.data;
      
      if (data?.success && data?.tenantSlug) {
        // Store portal session data
        localStorage.setItem('sessionToken', data.sessionToken || data.session_token);
        localStorage.setItem('tenantSlug', data.tenantSlug);
        
        if (data.deceased) {
          localStorage.setItem('deceased', JSON.stringify(data.deceased));
          localStorage.setItem('deceasedId', data.deceased.deceased_id);
        }
        
        // Set tenant context for subsequent requests
        api.defaults.headers.common['x-tenant-slug'] = data.tenantSlug;
      }
      
      return data;
    } catch (error) {
      // Restore previous tenant slug on error
      if (previousTenantSlug) {
        api.defaults.headers.common['x-tenant-slug'] = previousTenantSlug;
      }
      throw error;
    }
  },

  /**
   * Portal Logout — clear portal session
   */
  portalLogout: () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('deceased');
    localStorage.removeItem('deceasedId');
    delete api.defaults.headers.common['x-tenant-slug'];
    return { success: true };
  },

  /**
   * Get portal deceased info — GET /api/v1/restpoint/portal/deceased/:deceasedId
   */
  getPortalDeceased: async (deceasedId, tenantSlug) => {
    api.defaults.headers.common['x-tenant-slug'] = tenantSlug;
    const response = await api.get(`${ENDPOINTS.PORTAL.DECEASED}/${deceasedId}`);
    return response.data;
  },
};
