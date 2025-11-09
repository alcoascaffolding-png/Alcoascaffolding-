/**
 * Sales Order Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { salesOrderService } from '../../services/api';

const salesOrderSlice = createResourceSlice('salesOrders', salesOrderService);

export const {
  fetchAll: fetchSalesOrders,
  fetchById: fetchSalesOrderById,
  fetchStats: fetchSalesOrderStats,
  create: createSalesOrder,
  update: updateSalesOrder,
  delete: deleteSalesOrder
} = salesOrderSlice.actions;

export const { clearError, clearCurrentItem } = salesOrderSlice.actions;

export default salesOrderSlice.reducer;

