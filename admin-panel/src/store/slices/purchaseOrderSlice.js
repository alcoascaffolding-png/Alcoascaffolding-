/**
 * Purchase Order Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { purchaseOrderService } from '../../services/api';

const purchaseOrderSlice = createResourceSlice('purchaseOrders', purchaseOrderService);

export const {
  fetchAll: fetchPurchaseOrders,
  fetchById: fetchPurchaseOrderById,
  fetchStats: fetchPurchaseOrderStats,
  create: createPurchaseOrder,
  update: updatePurchaseOrder,
  delete: deletePurchaseOrder
} = purchaseOrderSlice.actions;

export const { clearError, clearCurrentItem } = purchaseOrderSlice.actions;

export default purchaseOrderSlice.reducer;

