import api from './axios';

/**
 * Public API layer for unauthenticated access
 * Used by family portal to view public deceased records and tenant branding
 */

export const publicApi = {
  /**
   * Get tenant branding info (public)
   * GET /api/public/tenants/:slug/branding
   */
  getTenantBranding: async (slug) => {
    try {
      const response = await api.get(`/api/public/tenants/${slug}/branding`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenant branding:', error);
      throw error;
    }
  },

  /**
   * Get public deceased record summary
   * GET /api/public/tenants/:slug/deceased/:publicId
   */
  getPublicDeceasedRecord: async (slug, publicId) => {
    try {
      const response = await api.get(`/api/public/tenants/${slug}/deceased/${publicId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch deceased record:', error);
      throw error;
    }
  },

  /**
   * Search public deceased records by name
   * GET /api/public/tenants/:slug/deceased/search?q=:query
   */
  searchPublicDeceased: async (slug, query) => {
    try {
      const response = await api.get(`/api/public/tenants/${slug}/deceased/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search deceased records:', error);
      throw error;
    }
  },

  /**
   * Scan QR code for deceased record
   * GET /api/public/deceased/:qrCode
   */
  scanQRCode: async (qrCode) => {
    try {
      const response = await api.get(`/api/public/deceased/${qrCode}`);
      return response.data;
    } catch (error) {
      console.error('Failed to scan QR code:', error);
      throw error;
    }
  },

  /**
   * Request family access to deceased record
   * POST /api/public/tenants/:slug/request-access
   * Body: { deceased_id, name, email, phone, relationship }
   */
  requestAccess: async (slug, accessRequest) => {
    try {
      const response = await api.post(`/api/public/tenants/${slug}/request-access`, accessRequest);
      return response.data;
    } catch (error) {
      console.error('Failed to request access:', error);
      throw error;
    }
  },

  /**
   * Book hearse service (if public access enabled)
   * POST /api/public/tenants/:slug/hearse/book
   * Body: { deceased_id, date, time, address }
   */
  bookHearse: async (slug, booking) => {
    try {
      const response = await api.post(`/api/public/tenants/${slug}/hearse/book`, booking);
      return response.data;
    } catch (error) {
      console.error('Failed to book hearse:', error);
      throw error;
    }
  },

  /**
   * Check if tenant exists and is public
   * GET /api/public/tenants/:slug/status
   */
  checkTenantStatus: async (slug) => {
    try {
      const response = await api.get(`/api/public/tenants/${slug}/status`);
      return response.data;
    } catch (error) {
      console.error('Tenant not found or not public:', error);
      throw error;
    }
  },

  /**
   * Get list of published deceased records (with pagination)
   * GET /api/public/tenants/:slug/deceased?page=1&limit=20
   */
  getPublishedDeceased: async (slug, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/api/public/tenants/${slug}/deceased`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch deceased records:', error);
      throw error;
    }
  },
};
