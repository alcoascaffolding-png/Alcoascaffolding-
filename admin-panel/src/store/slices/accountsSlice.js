/**
 * Accounts Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
  bankAccounts: [],
  receipts: [],
  payments: [],
  journalEntries: [],
  contraVouchers: [],
  loading: false,
  error: null,
};

export const fetchBankAccounts = createAsyncThunk('accounts/fetchBankAccounts', async (params = {}) => {
  const response = await axios.get('/admin/bank-accounts', { params });
  return response.data.data.documents;
});

export const fetchReceipts = createAsyncThunk('accounts/fetchReceipts', async (params = {}) => {
  const response = await axios.get('/admin/receipts', { params });
  return response.data.data.documents;
});

export const fetchPayments = createAsyncThunk('accounts/fetchPayments', async (params = {}) => {
  const response = await axios.get('/admin/payments', { params });
  return response.data.data.documents;
});

export const fetchJournalEntries = createAsyncThunk('accounts/fetchJournalEntries', async (params = {}) => {
  const response = await axios.get('/admin/journal-entries', { params });
  return response.data.data.documents;
});

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBankAccounts.pending, (state) => { state.loading = true; })
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.bankAccounts = action.payload;
      })
      .addCase(fetchBankAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.receipts = action.payload;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.journalEntries = action.payload;
      });
  },
});

export const { clearError } = accountsSlice.actions;
export default accountsSlice.reducer;

