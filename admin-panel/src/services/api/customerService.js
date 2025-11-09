/**
 * Customer API Service
 * All customer-related API calls
 */

import api from '../../api/axios';

const customerService = {
  /**
   * Get all customers with pagination and filters
   */
  getAll: async (params = {}) => {
    const { data } = await api.get('/customers', { params });
    return data;
  },

  /**
   * Get customer by ID
   */
  getById: async (id) => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  /**
   * Get customer statistics
   */
  getStats: async () => {
    const { data } = await api.get('/customers/stats');
    return data;
  },

  /**
   * Get total outstanding amount
   */
  getOutstanding: async () => {
    const { data } = await api.get('/customers/outstanding');
    return data;
  },

  /**
   * Create new customer
   */
  create: async (customerData) => {
    const { data } = await api.post('/customers', customerData);
    return data;
  },

  /**
   * Update customer
   */
  update: async (id, customerData) => {
    const { data } = await api.put(`/customers/${id}`, customerData);
    return data;
  },

  /**
   * Delete customer
   */
  delete: async (id) => {
    const { data} = await api.delete(`/customers/${id}`);
    return data;
  }
};

export default customerService;

