/**
 * Global Authentication & Authorization Detection Module
 * 
 * Provides centralized user authentication detection, authorization checks,
 * and tenant slug management for the entire application.
 */

import React from 'react';

// Storage keys
const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  TENANT: 'tenant',
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

/**
 * Get current authentication token
 */
export const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Get current tenant information
 */
export const getCurrentTenant = () => {
  try {
    const tenantData = localStorage.getItem(STORAGE_KEYS.TENANT);
    return tenantData ? JSON.parse(tenantData) : null;
  } catch (error) {
    console.error('Failed to parse tenant data:', error);
    return null;
  }
};

/**
 * Get tenant slug from current tenant or user data
 */
export const getTenantSlug = () => {
  // Try to get from tenant context first
  const tenant = getCurrentTenant();
  if (tenant?.slug) {
    return tenant.slug;
  }

  // Try to get from user data
  const user = getCurrentUser();
  if (user?.tenantSlug) {
    return user.tenantSlug;
  }

  // Default tenant slug
  return 'system_shared';
};

/**
 * Get user email
 */
export const getUserEmail = () => {
  const user = getCurrentUser();
  return user?.email || user?.username || null;
};

/**
 * Get user ID
 */
export const getUserId = () => {
  const user = getCurrentUser();
  return user?.id || user?.userId || user?._id || null;
};

/**
 * Get user role
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || user?.userRole || null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!(token && user);
};

/**
 * Check if user has specific role
 */
export const hasRole = (requiredRole) => {
  const userRole = getUserRole();
  if (!userRole || !requiredRole) return false;
  
  // Handle array of roles
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) return false;
  return roles.some(role => hasRole(role));
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.isAdmin || user?.role === 'admin' || false;
};

/**
 * Check if user is super admin
 */
export const isSuperAdmin = () => {
  const user = getCurrentUser();
  return user?.isSuperAdmin || user?.role === 'super_admin' || false;
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = () => {
  const token = getAuthToken();
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-Slug': getTenantSlug(),
  };
};

/**
 * Get full user information object
 */
export const getUserInfo = () => {
  const user = getCurrentUser();
  if (!user) return null;

  return {
    id: getUserId(),
    email: getUserEmail(),
    role: getUserRole(),
    tenantSlug: getTenantSlug(),
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    ...user,
  };
};

/**
 * Clear all authentication data (logout)
 */
export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TENANT);
};

/**
 * Set authentication data
 */
export const setAuthData = ({ user, token, tenant }) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }
  if (tenant) {
    localStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(tenant));
  }
};

/**
 * Authorization check helper
 */
export const checkAuthorization = (requiredRoles = []) => {
  if (!isAuthenticated()) {
    return {
      authorized: false,
      reason: 'User not authenticated',
      redirectTo: '/login',
    };
  }

  if (requiredRoles.length === 0) {
    return {
      authorized: true,
      reason: 'No specific role required',
    };
  }

  const hasRequiredRole = hasAnyRole(requiredRoles);
  
  if (!hasRequiredRole) {
    return {
      authorized: false,
      reason: `Insufficient permissions. Required: ${requiredRoles.join(', ')}`,
      redirectTo: '/unauthorized',
    };
  }

  return {
    authorized: true,
    reason: 'Authorized',
  };
};

/**
 * Global auth state listener
 * Returns an object with current auth state and methods to subscribe to changes
 */
class AuthStateManager {
  constructor() {
    this.listeners = new Set();
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      isAuthenticated: isAuthenticated(),
      user: getCurrentUser(),
      tenant: getCurrentTenant(),
      tenantSlug: getTenantSlug(),
      userId: getUserId(),
      userEmail: getUserEmail(),
      userRole: getUserRole(),
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.state = this.getInitialState();
    this.listeners.forEach(listener => listener(this.state));
  }

  getState() {
    return this.state;
  }

  refresh() {
    this.notify();
  }
}

// Create global auth state manager instance
export const authStateManager = new AuthStateManager();

/**
 * React hook for using global auth state
 * Can be used in any component to access auth information
 */
export const useGlobalAuth = () => {
  const [state, setState] = React.useState(authStateManager.getState());

  React.useEffect(() => {
    const unsubscribe = authStateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
};

export default {
  getCurrentUser,
  getAuthToken,
  getCurrentTenant,
  getTenantSlug,
  getUserEmail,
  getUserId,
  getUserRole,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  isAdmin,
  isSuperAdmin,
  getAuthHeader,
  getUserInfo,
  clearAuthData,
  setAuthData,
  checkAuthorization,
  authStateManager,
  useGlobalAuth,
};