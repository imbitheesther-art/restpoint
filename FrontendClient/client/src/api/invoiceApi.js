import api from './axios';
import { ENDPOINTS } from './endpoints';

export const invoiceApi = {
  /**
   * List all invoices
   */
  list: async (params = {}) => {
    const response = await api.get(ENDPOINTS.INVOICE.LIST, { params });
    return response.data;
  },

  /**
   * Create a new invoice
   */
  create: async (data) => {
    const response = await api.post(ENDPOINTS.INVOICE.CREATE, data);
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  getById: async (id) => {
    const response = await api.get(ENDPOINTS.INVOICE.DETAIL(id));
    return response.data;
  },

  /**
   * Update an invoice
   */
  update: async (id, data) => {
    const response = await api.put(ENDPOINTS.INVOICE.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete an invoice
   */
  delete: async (id) => {
    const response = await api.delete(ENDPOINTS.INVOICE.DELETE(id));
    return response.data;
  },

  /**
   * Make a payment on an invoice
   */
  pay: async (id, payload) => {
    const response = await api.post(ENDPOINTS.INVOICE.PAY(id), payload);
    return response.data;
  },

  /**
   * Get invoice as PDF
   */
  getPDF: async (id) => {
    const response = await api.get(ENDPOINTS.INVOICE.PDF(id), { responseType: 'blob' });
    return response.data;
  },

  /**
   * Initiate MPESA payment for invoice
   */
  mpesa: async (id, phone) => {
    const response = await api.post(ENDPOINTS.INVOICE.MPESA(id), { phone });
    return response.data;
  },

  /**
   * Generate invoice for a deceased
   * @param {string} deceasedId - Deceased ID
   * @param {Object} options - Invoice generation options
   */
  generate: async (deceasedId, options = {}) => {
    const response = await api.get(ENDPOINTS.INVOICE.GENERATE(deceasedId), { params: options });
    return response.data;
  },
};
