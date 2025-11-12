/**
 * Customer API Service
 * Handles all API calls related to customers
 */

import api from '../../api/axios';

const customerService = {
  /**
   * Get all customers with filters and pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  /**
   * Get customer by ID
   */
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  /**
   * Get customer statistics
   */
  getStats: async () => {
    const response = await api.get('/customers/stats');
    return response.data;
  },

  /**
   * Create new customer
   */
  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  /**
   * Update existing customer
   */
  update: async (id, customerData) => {
    const response = await api.patch(`/customers/${id}`, customerData);
    return response.data;
  },

  /**
   * Delete customer (soft delete by default)
   */
  delete: async (id, hard = false) => {
    const response = await api.delete(`/customers/${id}`, {
      params: { hard }
    });
    return response.data;
  },

  /**
   * Add contact person to customer
   */
  addContact: async (customerId, contactData) => {
    const response = await api.post(`/customers/${customerId}/contacts`, contactData);
    return response.data;
  },

  /**
   * Update contact person
   */
  updateContact: async (customerId, contactId, contactData) => {
    const response = await api.patch(`/customers/${customerId}/contacts/${contactId}`, contactData);
    return response.data;
  },

  /**
   * Delete contact person
   */
  deleteContact: async (customerId, contactId) => {
    const response = await api.delete(`/customers/${customerId}/contacts/${contactId}`);
    return response.data;
  },

  /**
   * Add address to customer
   */
  addAddress: async (customerId, addressData) => {
    const response = await api.post(`/customers/${customerId}/addresses`, addressData);
    return response.data;
  },

  /**
   * Update address
   */
  updateAddress: async (customerId, addressId, addressData) => {
    const response = await api.patch(`/customers/${customerId}/addresses/${addressId}`, addressData);
    return response.data;
  },

  /**
   * Delete address
   */
  deleteAddress: async (customerId, addressId) => {
    const response = await api.delete(`/customers/${customerId}/addresses/${addressId}`);
    return response.data;
  },

  /**
   * Check for new customers (lightweight polling)
   */
  checkForNew: async (lastCheck) => {
    const response = await api.get('/customers/check-new', {
      params: { lastCheck }
    });
    return response.data;
  }
};

export default customerService;
