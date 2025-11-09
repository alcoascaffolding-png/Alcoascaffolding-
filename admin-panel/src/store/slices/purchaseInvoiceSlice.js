/**
 * Purchase Invoice Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { purchaseInvoiceService } from '../../services/api';

const purchaseInvoiceSlice = createResourceSlice('purchaseInvoices', purchaseInvoiceService);

export const {
  fetchAll: fetchPurchaseInvoices,
  fetchById: fetchPurchaseInvoiceById,
  fetchStats: fetchPurchaseInvoiceStats,
  create: createPurchaseInvoice,
  update: updatePurchaseInvoice,
  delete: deletePurchaseInvoice
} = purchaseInvoiceSlice.actions;

export const { clearError, clearCurrentItem } = purchaseInvoiceSlice.actions;

export default purchaseInvoiceSlice.reducer;

