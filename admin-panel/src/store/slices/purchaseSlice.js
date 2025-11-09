/**
 * Purchase Slice - handles purchase orders, invoices, returns
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
  orders: [],
  invoices: [],
  returns: [],
  loading: false,
  error: null,
};

export const fetchPurchaseOrders = createAsyncThunk('purchase/fetchOrders', async (params = {}) => {
  const response = await axios.get('/admin/purchase-orders', { params });
  return response.data.data.documents;
});

export const createPurchaseOrder = createAsyncThunk('purchase/createOrder', async (data) => {
  const response = await axios.post('/admin/purchase-orders', data);
  return response.data.data.document;
});

export const fetchPurchaseInvoices = createAsyncThunk('purchase/fetchInvoices', async (params = {}) => {
  const response = await axios.get('/admin/purchase-invoices', { params });
  return response.data.data.documents;
});

export const createPurchaseInvoice = createAsyncThunk('purchase/createInvoice', async (data) => {
  const response = await axios.post('/admin/purchase-invoices', data);
  return response.data.data.document;
});

const purchaseSlice = createSlice({
  name: 'purchase',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })
      .addCase(fetchPurchaseInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload;
      })
      .addCase(createPurchaseInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload);
      });
  },
});

export const { clearError } = purchaseSlice.actions;
export default purchaseSlice.reducer;

