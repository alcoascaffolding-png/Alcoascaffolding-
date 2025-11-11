/**
 * Contact Message API Service
 * All contact message-related API calls
 */

import api from '../../api/axios';

const contactMessageService = {
  /**
   * LIGHTWEIGHT CHECK - Only check if new messages exist
   * Reduces bandwidth by 95% - perfect for polling
   */
  checkForNew: async (lastCheck) => {
    const params = lastCheck ? { lastCheck } : {};
    const { data } = await api.get('/contact-messages/check-new', { params });
    return data;
  },

  /**
   * Get all contact messages with pagination and filters
   */
  getAll: async (params = {}) => {
    const { data } = await api.get('/contact-messages', { params });
    return data;
  },

  /**
   * Get contact message by ID
   */
  getById: async (id) => {
    const { data } = await api.get(`/contact-messages/${id}`);
    return data;
  },

  /**
   * Get contact message statistics
   */
  getStats: async () => {
    const { data } = await api.get('/contact-messages/stats');
    return data;
  },

  /**
   * Update contact message
   */
  update: async (id, messageData) => {
    const { data } = await api.patch(`/contact-messages/${id}`, messageData);
    return data;
  },

  /**
   * Delete contact message
   */
  delete: async (id) => {
    const { data } = await api.delete(`/contact-messages/${id}`);
    return data;
  },

  /**
   * Bulk update messages
   */
  bulkUpdate: async (ids, updates) => {
    const { data } = await api.post('/contact-messages/bulk-update', { ids, updates });
    return data;
  }
};

export default contactMessageService;

