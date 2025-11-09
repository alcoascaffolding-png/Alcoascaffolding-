/**
 * Stock Adjustment Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { stockAdjustmentService } from '../../services/api';

const stockAdjustmentSlice = createResourceSlice('stockAdjustments', stockAdjustmentService);

export const {
  fetchAll: fetchStockAdjustments,
  fetchById: fetchStockAdjustmentById,
  fetchStats: fetchStockAdjustmentStats,
  create: createStockAdjustment,
  update: updateStockAdjustment,
  delete: deleteStockAdjustment
} = stockAdjustmentSlice.actions;

export const { clearError, clearCurrentItem } = stockAdjustmentSlice.actions;

export default stockAdjustmentSlice.reducer;

