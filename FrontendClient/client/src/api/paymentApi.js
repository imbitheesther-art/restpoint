/**
 * Payment API Service
 * Handles all payment-related API calls including MPESA and bank payments
 */
import api from './axios';
import { ENDPOINTS } from './endpoints';

export const paymentApi = {
  /**
   * Update payment for a deceased
   * @param {Object} paymentData - Payment data
   */
  updatePayment: async (paymentData) => {
    const response = await api.post(ENDPOINTS.PAYMENT.UPDATE, paymentData);
    return response.data;
  },

  /**
   * Initiate STK push for MPESA payment
   * @param {Object} stkData - STK push data
   */
  initiateSTKPush: async (stkData) => {
    const response = await api.post(ENDPOINTS.PAYMENT.STK_PUSH, stkData);
    return response.data;
  },

  /**
   * Get payment history for a deceased
   * @param {string} deceasedId - Deceased ID
   */
  getPaymentHistory: async (deceasedId) => {
    const response = await api.get(ENDPOINTS.PAYMENT.DETAIL(deceasedId));
    return response.data.data || [];
  },

  /**
   * Get all payments (admin)
   * @param {Object} params - Query parameters
   */
  getAllPayments: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PAYMENT.LIST, { params });
    return response.data.data || [];
  },

  /**
   * Get payment statistics
   */
  getPaymentStats: async () => {
    const response = await api.get(ENDPOINTS.PAYMENT.STATS);
    return response.data.data || { total: 0, pending: 0, completed: 0 };
  },

  /**
   * Verify MPESA payment
   * @param {Object} verificationData - Verification data
   */
  verifyMPESAPayment: async (verificationData) => {
    const response = await api.post(ENDPOINTS.PAYMENT.VERIFY_MPESA, verificationData);
    return response.data;
  },

  /**
   * Record manual payment
   * @param {Object} paymentData - Payment data
   */
  recordManualPayment: async (paymentData) => {
    const response = await api.post(ENDPOINTS.PAYMENT.MANUAL, paymentData);
    return response.data;
  },

  /**
   * Delete payment record
   * @param {string} paymentId - Payment ID
   */
  deletePayment: async (paymentId) => {
    const response = await api.delete(ENDPOINTS.PAYMENT.DELETE(paymentId));
    return response.data;
  },

  /**
   * Update payment status
   * @param {string} paymentId - Payment ID
   * @param {Object} updateData - Update data
   */
  updatePaymentStatus: async (paymentId, updateData) => {
    const response = await api.patch(ENDPOINTS.PAYMENT.STATUS(paymentId), updateData);
    return response.data;
  }
};

export default paymentApi;
