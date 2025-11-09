/**
 * Common API Service Factory
 * Generate API services for any resource
 */

import api from '../../api/axios';

const createApiService = (resourceName) => ({
  getAll: async (params = {}) => {
    const { data } = await api.get(`/${resourceName}`, { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/${resourceName}/${id}`);
    return data;
  },
  getStats: async () => {
    const { data } = await api.get(`/${resourceName}/stats`);
    return data;
  },
  create: async (itemData) => {
    const { data } = await api.post(`/${resourceName}`, itemData);
    return data;
  },
  update: async (id, itemData) => {
    const { data } = await api.put(`/${resourceName}/${id}`, itemData);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/${resourceName}/${id}`);
    return data;
  }
});

// Create all services
export const salesOrderService = createApiService('sales-orders');
export const salesInvoiceService = createApiService('sales-invoices');
export const vendorService = createApiService('vendors');
export const productService = createApiService('products');
export const purchaseOrderService = createApiService('purchase-orders');
export const purchaseInvoiceService = createApiService('purchase-invoices');
export const stockAdjustmentService = createApiService('stock-adjustments');
export const bankAccountService = createApiService('bank-accounts');
export const receiptService = createApiService('receipts');
export const paymentService = createApiService('payments');

