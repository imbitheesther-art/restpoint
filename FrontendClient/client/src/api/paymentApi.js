/**
 * Payment API Service
 * Handles all payment-related API calls including MPESA and bank payments
 */
import api from './axios';

export const paymentApi = {
  /**
   * Update payment for a deceased
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.deceasedId - Deceased ID
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.paymentMethod - Payment method (mpesa, bank)
   * @param {string} [paymentData.reference] - Payment reference
   * @param {string} [paymentData.phoneNumber] - Phone number for MPESA
   * @param {string} [paymentData.bankName] - Bank name for bank payments
   * @param {string} paymentData.transactionDate - Transaction date
   */
  updatePayment: async (paymentData) => {
    const response = await api.post('/api/v1/restpoint/update-payment', paymentData);
    return response.data;
  },

  /**
   * Initiate STK push for MPESA payment
   * @param {Object} stkData - STK push data
   * @param {string} stkData.deceasedId - Deceased ID
   * @param {number} stkData.amount - Amount to push
   * @param {string} stkData.phoneNumber - Phone number for STK push
   */
  initiateSTKPush: async (stkData) => {
    const response = await api.post('/api/v1/restpoint/initiate-stk-push', stkData);
    return response.data;
  },

  /**
   * Get payment history for a deceased
   * @param {string} deceasedId - Deceased ID
   */
  getPaymentHistory: async (deceasedId) => {
    const response = await api.get(`/api/v1/restpoint/payments/${deceasedId}`);
    return response.data.data || [];
  },

  /**
   * Get all payments (admin)
   * @param {Object} params - Query parameters
   */
  getAllPayments: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/api/v1/restpoint/payments?${queryParams.toString()}`);
    return response.data.data || [];
  },

  /**
   * Get payment statistics
   */
  getPaymentStats: async () => {
    const response = await api.get('/api/v1/restpoint/payments/stats');
    return response.data.data || { total: 0, pending: 0, completed: 0 };
  },

  /**
   * Verify MPESA payment
   * @param {Object} verificationData - Verification data
   * @param {string} verificationData.transactionId - MPESA transaction ID
   * @param {string} verificationData.deceasedId - Deceased ID
   */
  verifyMPESAPayment: async (verificationData) => {
    const response = await api.post('/api/v1/restpoint/verify-mpesa', verificationData);
    return response.data;
  },

  /**
   * Record manual payment
   * @param {Object} paymentData - Payment data
   */
  recordManualPayment: async (paymentData) => {
    const response = await api.post('/api/v1/restpoint/payments/manual', paymentData);
    return response.data;
  },

  /**
   * Delete payment record
   * @param {string} paymentId - Payment ID
   */
  deletePayment: async (paymentId) => {
    const response = await api.delete(`/api/v1/restpoint/payments/${paymentId}`);
    return response.data;
  },

  /**
   * Update payment status
   * @param {string} paymentId - Payment ID
   * @param {Object} updateData - Update data
   */
  updatePaymentStatus: async (paymentId, updateData) => {
    const response = await api.patch(`/api/v1/restpoint/payments/${paymentId}/status`, updateData);
    return response.data;
  }
};

export default paymentApi;