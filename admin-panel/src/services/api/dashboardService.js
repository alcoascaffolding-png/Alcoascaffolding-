/**
 * Dashboard API Service
 * All dashboard-related API calls
 */

import api from '../../api/axios';

const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },

  /**
   * Get sales overview for charts
   */
  getSalesOverview: async (period = '6months') => {
    const { data } = await api.get('/dashboard/sales-overview', {
      params: { period }
    });
    return data;
  },

  /**
   * Get recent activities
   */
  getRecentActivities: async (limit = 10) => {
    const { data } = await api.get('/dashboard/recent-activities', {
      params: { limit }
    });
    return data;
  },

  /**
   * Get top customers by revenue
   */
  getTopCustomers: async (limit = 5) => {
    const { data } = await api.get('/dashboard/top-customers', {
      params: { limit }
    });
    return data;
  },

  /**
   * Get pending invoices
   */
  getPendingInvoices: async (limit = 10) => {
    const { data } = await api.get('/dashboard/pending-invoices', {
      params: { limit }
    });
    return data;
  }
};

export default dashboardService;

