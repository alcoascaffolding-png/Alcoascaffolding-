/**
 * Payment Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { paymentService } from '../../services/api';

const paymentSlice = createResourceSlice('payments', paymentService);

export const {
  fetchAll: fetchPayments,
  fetchById: fetchPaymentById,
  fetchStats: fetchPaymentStats,
  create: createPayment,
  update: updatePayment,
  delete: deletePayment
} = paymentSlice.actions;

export const { clearError, clearCurrentItem } = paymentSlice.actions;

export default paymentSlice.reducer;

