/**
 * Receipt Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { receiptService } from '../../services/api';

const receiptSlice = createResourceSlice('receipts', receiptService);

export const {
  fetchAll: fetchReceipts,
  fetchById: fetchReceiptById,
  fetchStats: fetchReceiptStats,
  create: createReceipt,
  update: updateReceipt,
  delete: deleteReceipt
} = receiptSlice.actions;

export const { clearError, clearCurrentItem } = receiptSlice.actions;

export default receiptSlice.reducer;

