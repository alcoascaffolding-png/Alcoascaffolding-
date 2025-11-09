/**
 * Bank Account Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { bankAccountService } from '../../services/api';

const bankAccountSlice = createResourceSlice('bankAccounts', bankAccountService);

export const {
  fetchAll: fetchBankAccounts,
  fetchById: fetchBankAccountById,
  fetchStats: fetchBankAccountStats,
  create: createBankAccount,
  update: updateBankAccount,
  delete: deleteBankAccount
} = bankAccountSlice.actions;

export const { clearError, clearCurrentItem } = bankAccountSlice.actions;

export default bankAccountSlice.reducer;

