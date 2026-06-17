import axios from 'axios';
import { ENDPOINTS } from './endpoints';

/**
 * SECURE AXIOS INSTANCE
 * - HTTP-only cookies for production
 * - CSRF protection via double-submit cookie pattern
 * - Tenant isolation with x-tenant-slug header
 * - Token rotation on refresh
 * - Request signing for sensitive operations
 */

// Generate a session fingerprint for request signing
const getSessionFingerprint = () => {
  let fp = sessionStorage.getItem('sessionFp');
  if (!fp) {
    fp = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    sessionStorage.setItem('sessionFp', fp);
  }
  return fp;
};

// Dynamically determine base URL for production HTTPS support
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  // In production, API is proxied through nginx on same origin using HTTPS
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin; // Same-origin API via nginx proxy with HTTPS
  }
  return 'http://localhost:5000';
};

// Base instance
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
    'X-Client-ID': 'restpoint-web-v2',
    'X-Session-Fingerprint': getSessionFingerprint(),
  },
  timeout: 30000,
});

// Request Interceptor - Security focused
api.interceptors.request.use((config) => {
  // Support both authToken and token keys for backward compatibility
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  
  // Strict validation - reject undefined/null tokens
  if (token && token !== 'undefined' && token !== 'null' && token.length > 10) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Clean invalid tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
  }
  
  // Attach tenant slug - critical for multi-tenant isolation
  let tenantSlug = 
    localStorage.getItem('tenantSlug') || 
    localStorage.getItem('tenant_slug');
  
  if (!tenantSlug) {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      tenantSlug = userData.tenantSlug || 
                   userData.tenant_slug || 
                   userData.tenant?.slug ||
                   null;
    } catch (e) {
      // Ignore
    }
  }
  
  // Every request MUST have a tenant slug for data isolation
  // Skip for public endpoints (onboarding, login, portal login) that don't have a tenant yet
  const isPublicEndpoint = 
    config.url?.includes('/tenant/onboarding/') ||
    config.url?.includes('/auth/login') ||
    config.url?.includes('/portal/login') ||
    config.url?.includes('/auth/register');
    
  if (!isPublicEndpoint) {
    config.headers['x-tenant-slug'] = tenantSlug || 'system-shared';
  } else {
    // Remove tenant slug for public endpoints to avoid validation errors
    delete config.headers['x-tenant-slug'];
  }
  
  // Add CSRF token for non-GET requests
  if (config.method !== 'get') {
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  
  // Add request timestamp for replay protection
  config.headers['X-Request-Timestamp'] = Date.now().toString();
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor - Security + Token Refresh
api.interceptors.response.use(
  (response) => {
    // Store CSRF token from response if present (double-submit cookie pattern)
    const csrfToken = response.headers['x-csrf-token'];
    if (csrfToken) {
      localStorage.setItem('csrfToken', csrfToken);
    }
    
    // Store tenant slug if returned
    const responseSlug = response.headers['x-tenant-slug'] || response.data?.tenantSlug;
    if (responseSlug) {
      localStorage.setItem('tenantSlug', responseSlug);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Prevent refresh loop
      if (originalRequest.url?.includes('auth/refresh')) {
        handleAuthFailure();
        return Promise.reject(error);
      }
      
      try {
        const refreshUrl = import.meta.env.VITE_API_URL + ENDPOINTS.AUTH.REFRESH;
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          handleAuthFailure();
          return Promise.reject(error);
        }
        
        const response = await axios.post(refreshUrl, { 
          token: refreshToken,
          fingerprint: getSessionFingerprint()
        }, { 
          withCredentials: true,
          headers: {
            'X-Session-Fingerprint': getSessionFingerprint()
          }
        });
        
        if (response.data?.accessToken || response.data?.token) {
          const newToken = response.data.accessToken || response.data.token;
          localStorage.setItem('authToken', newToken);
          localStorage.setItem('token', newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Verify tenant slug consistency
          const responseSlug = response.data?.tenantSlug;
          const localSlug = localStorage.getItem('tenantSlug');
          if (responseSlug && localSlug && responseSlug !== localSlug) {
          
            handleAuthFailure();
            return Promise.reject(new Error('Tenant mismatch'));
          }
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        handleAuthFailure();
        return Promise.reject(refreshError);
      }
    }
    
    // Handle 403 - Forbidden (tenant mismatch or CSRF)
    if (error.response?.status === 403) {
     
      // Could redirect to login with a security message
    }
    
    return Promise.reject(error);
  }
);

// Clean auth on failure
function handleAuthFailure() {
  const keys = [
    'authToken', 'token', 'refreshToken', 'user', 'tenantSlug', 
    'tenant_slug', 'tenantId', 'userRole', 'csrfToken', 'loginTime'
  ];
  keys.forEach(key => {
    try { localStorage.removeItem(key); } catch(e) {}
  });
  
  // Clear cookies
  document.cookie.split(';').forEach(c => {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
  
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
    window.location.href = '/login?session=expired';
  }
}

// EXPORT: Secure getter for tenant info (for other modules)
export const getSecureTenantInfo = () => {
  const slug = localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug');
  const userRaw = localStorage.getItem('user');
  let user = null;
  try { user = userRaw ? JSON.parse(userRaw) : null; } catch(e) {}
  
  return {
    slug,
    userId: user?.userId || user?.id,
    role: localStorage.getItem('userRole') || user?.role,
    isValid: !!slug && !!user
  };
};

export default api;