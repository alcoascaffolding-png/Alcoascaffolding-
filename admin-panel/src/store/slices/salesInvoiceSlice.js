/**
 * Sales Invoice Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { salesInvoiceService } from '../../services/api';

const salesInvoiceSlice = createResourceSlice('salesInvoices', salesInvoiceService);

export const {
  fetchAll: fetchSalesInvoices,
  fetchById: fetchSalesInvoiceById,
  fetchStats: fetchSalesInvoiceStats,
  create: createSalesInvoice,
  update: updateSalesInvoice,
  delete: deleteSalesInvoice
} = salesInvoiceSlice.actions;

export const { clearError, clearCurrentItem } = salesInvoiceSlice.actions;

export default salesInvoiceSlice.reducer;

