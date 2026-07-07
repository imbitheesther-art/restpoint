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

  getTenantSettings: async () => {
    try {
      const response = await api.get('/tenant/settings');
      return response.data;
    } catch (err) {
      console.warn('⚠️ Tenant settings API failed:', err.message);
      return null;
    }
  },

  getBranches: async () => {
    try {
      const response = await api.get(ENDPOINTS.TENANT.BRANCHES);
      return response.data;
    } catch (err) {
      console.warn('⚠️ Branches API failed:', err.message);
      return null;
    }
  },

  registerTenant: async (tenantData) => {
    const response = await api.post(ENDPOINTS.TENANT.REGISTER, tenantData);
    return response.data;
  }
};