/**
 * Dashboard API Service
 * All dashboard-related API calls
 */

import api from '../../api/axios';
import { mockDashboardData, simulateApiDelay, mockApiResponse } from './mockDashboardData';
import { DEMO_MODE, API_DELAYS } from '../../config/demo.config';

const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    if (DEMO_MODE) {
      await simulateApiDelay(API_DELAYS.stats);
      return mockApiResponse(mockDashboardData.stats);
    }
    const { data } = await api.get('/dashboard/stats');
    return data;
  },

  /**
   * Get sales overview for charts
   */
  getSalesOverview: async (period = '6months') => {
    if (DEMO_MODE) {
      await simulateApiDelay(API_DELAYS.salesOverview);
      return mockApiResponse(mockDashboardData.salesOverview);
    }
    const { data } = await api.get('/dashboard/sales-overview', {
      params: { period }
    });
    return data;
  },

  /**
   * Get recent activities
   */
  getRecentActivities: async (limit = 10) => {
    if (DEMO_MODE) {
      await simulateApiDelay(API_DELAYS.recentActivities);
      return mockApiResponse(mockDashboardData.recentActivities);
    }
    const { data } = await api.get('/dashboard/recent-activities', {
      params: { limit }
    });
    return data;
  },

  /**
   * Get top customers by revenue
   */
  getTopCustomers: async (limit = 5) => {
    if (DEMO_MODE) {
      await simulateApiDelay(API_DELAYS.topCustomers);
      return mockApiResponse(mockDashboardData.topCustomers);
    }
    const { data } = await api.get('/dashboard/top-customers', {
      params: { limit }
    });
    return data;
  },

  /**
   * Get pending invoices
   */
  getPendingInvoices: async (limit = 10) => {
    if (DEMO_MODE) {
      await simulateApiDelay(API_DELAYS.pendingInvoices);
      return mockApiResponse(mockDashboardData.pendingInvoices);
    }
    const { data } = await api.get('/dashboard/pending-invoices', {
      params: { limit }
    });
    return data;
  }
};

export default dashboardService;

