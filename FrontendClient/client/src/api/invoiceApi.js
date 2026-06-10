import api from './axios';

export const invoiceApi = {
  /**
   * List all invoices
   */
  list: async (params = {}) => {
    const response = await api.get('/api/v1/restpoint/invoices', { params });
    return response.data;
  },

  /**
   * Create a new invoice
   */
  create: async (data) => {
    const response = await api.post('/api/v1/restpoint/invoices', data);
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  getById: async (id) => {
    const response = await api.get(`/api/v1/restpoint/invoices/${id}`);
    return response.data;
  },

  /**
   * Update an invoice
   */
  update: async (id, data) => {
    const response = await api.put(`/api/v1/restpoint/invoices/${id}`, data);
    return response.data;
  },

  /**
   * Delete an invoice
   */
  delete: async (id) => {
    const response = await api.delete(`/api/v1/restpoint/invoices/${id}`);
    return response.data;
  },

  /**
   * Make a payment on an invoice
   */
  pay: async (id, payload) => {
    const response = await api.post(`/api/v1/restpoint/invoices/${id}/pay`, payload);
    return response.data;
  },

  /**
   * Get invoice as PDF
   */
  getPDF: async (id) => {
    const response = await api.get(`/api/v1/restpoint/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  /**
   * Initiate MPESA payment for invoice
   */
  mpesa: async (id, phone) => {
    const response = await api.post(`/api/v1/restpoint/invoices/${id}/mpesa`, { phone });
    return response.data;
  },

  /**
   * Generate invoice for a deceased
   * @param {string} deceasedId - Deceased ID
   * @param {Object} options - Invoice generation options
   */
  generate: async (deceasedId, options = {}) => {
    const response = await api.get(`/api/v1/restpoint/invoice/${deceasedId}`, { params: options });
    return response.data;
  },
};
