/**
 * Custom Hook for Mock Data
 * Toggle between mock data and real API
 */

import { useState, useEffect } from 'react';
import * as mockData from '../data/mockData';

// Set this to false to use real API
const USE_MOCK_DATA = true;

export const useMockData = (dataType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      setTimeout(() => {
        const mockDataMap = {
          customers: mockData.mockCustomers,
          vendors: mockData.mockVendors,
          products: mockData.mockProducts,
          quotes: mockData.mockQuotes,
          salesOrders: mockData.mockSalesOrders,
          salesInvoices: mockData.mockSalesInvoices,
          purchaseOrders: mockData.mockPurchaseOrders,
          purchaseInvoices: mockData.mockPurchaseInvoices,
          stockAdjustments: mockData.mockStockAdjustments,
          bankAccounts: mockData.mockBankAccounts,
          receipts: mockData.mockReceipts,
          payments: mockData.mockPayments,
          dashboardStats: mockData.mockDashboardStats,
        };

        setData(mockDataMap[dataType] || []);
        setLoading(false);
      }, 500); // 500ms delay to simulate API
    }
  }, [dataType]);

  return { data, loading };
};

export { USE_MOCK_DATA };

