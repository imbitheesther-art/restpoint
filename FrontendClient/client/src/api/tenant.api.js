import api from './axios';
import { ENDPOINTS } from './endpoints';

export const tenantApi = {
  getBranding: async (slug) => {
    try {
      // Try to fetch from the real backend first
      const response = await api.get(ENDPOINTS.TENANT.CONFIG(slug));
      return response.data;
    } catch (err) {
      // Fallback mock for development
      console.warn('⚠️ Branding API failed, using mock:', err.message);
      return {
        name: slug || 'RESTPOINT Default Tenant',
        logo: '/mock-logo.png',
        primaryColor: '#2b5a82',
        features: {
          hearseTracking: false,
          analytics: true,
          invoicing: true
        }
      };
    }
  },

  getTenantSettings: async (tenantSlug, dbName) => {
    try {
      // Use tenantSlug from parameter or localStorage
      const slug = tenantSlug || localStorage.getItem('tenantSlug');

      if (!slug) {
        console.warn('⚠️ No tenantSlug provided or found in localStorage');
        return {
          deploymentType: 'single',
          branchCount: 0,
          tenantName: 'Default Tenant',
          tenantSlug: 'default'
        };
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const url = ENDPOINTS.TENANT.SETTINGS(slug);
        const response = await api.get(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response.data;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err) {
      console.warn('⚠️ Tenant settings API failed:', err.message);
      // Return default multi-tenant settings for development
      return {
        deploymentType: 'single',
        branchCount: 0,
        tenantName: 'Default Tenant',
        tenantSlug: 'default'
      };
    }
  },

  getBranches: async (tenantSlug, dbName) => {
    try {
      // Use tenantSlug from parameter or localStorage
      const slug = tenantSlug || localStorage.getItem('tenantSlug');

      if (!slug) {
        console.warn('⚠️ No tenantSlug provided or found in localStorage');
        return null;
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const url = ENDPOINTS.TENANT.BRANCHES(slug);
        const response = await api.get(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response.data;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err) {
      console.warn('⚠️ Branches API failed:', err.message);
      return null;
    }
  },

  // Branch-aware endpoints for multi-tenant
  getBranchUsers: async (tenantSlug, branchSlug) => {
    try {
      const url = ENDPOINTS.TENANT_BRANCH?.USERS?.(tenantSlug, branchSlug) || `/tenant/${tenantSlug}/${branchSlug}/users`;
      const response = await api.get(url);
      return response.data;
    } catch (err) {
      console.warn('⚠️ Branch users API failed:', err.message);
      return null;
    }
  },

  getBranchBranches: async (tenantSlug, branchSlug) => {
    try {
      const url = ENDPOINTS.TENANT_BRANCH?.BRANCHES?.(tenantSlug) || `/tenant/${tenantSlug}/branches`;
      const response = await api.get(url);
      return response.data;
    } catch (err) {
      console.warn('⚠️ Branch branches API failed:', err.message);
      return null;
    }
  },

  registerTenant: async (tenantData) => {
    const response = await api.post(ENDPOINTS.TENANT.REGISTER, tenantData);
    return response.data;
  }
};