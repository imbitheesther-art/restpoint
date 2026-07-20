/**
 * Global authentication utility helpers
 */

/**
 * Get the current tenant slug from localStorage
 */
export const getTenantSlug = () => {
  return (
    localStorage.getItem('tenantSlug') ||
    localStorage.getItem('tenant_slug') ||
    (() => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.tenantSlug || user.tenant?.slug || 'default';
      } catch {
        return 'default';
      }
    })()
  );
};

/**
 * Get the current auth token from localStorage or sessionStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
};

/**
 * Get the current user ID from localStorage
 */
export const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || user.userId || user._id || null;
  } catch {
    return null;
  }
};
