/**
 * Quotation API Service
 * Handles all API calls related to quotations
 */

import api from '../../api/axios';

const quotationService = {
  /**
   * Get all quotations with filters and pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get('/quotes', { params });
    return response.data;
  },

  /**
   * Get quotation by ID
   */
  getById: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },

  /**
   * Get quotation statistics
   */
  getStats: async () => {
    const response = await api.get('/quotes/stats');
    return response.data;
  },

  /**
   * Create new quotation
   */
  create: async (quotationData) => {
    const response = await api.post('/quotes', quotationData);
    return response.data;
  },

  /**
   * Update existing quotation
   */
  update: async (id, quotationData) => {
    const response = await api.patch(`/quotes/${id}`, quotationData);
    return response.data;
  },

  /**
   * Delete quotation
   */
  delete: async (id) => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },

  /**
   * Check for new quotations (lightweight polling)
   */
  checkForNew: async (lastCheck) => {
    const response = await api.get('/quotes/check-new', {
      params: { lastCheck }
    });
    return response.data;
  },

  /**
   * Send quotation via email
   */
  sendEmail: async (id, emailData) => {
    const response = await api.post(`/quotes/${id}/send-email`, emailData);
    return response.data;
  }
};

export default quotationService;

