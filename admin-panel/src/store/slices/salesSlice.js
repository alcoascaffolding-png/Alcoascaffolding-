/**
 * Sales Slice - handles quotes, orders, invoices, returns
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
  quotes: [],
  orders: [],
  invoices: [],
  returns: [],
  deliveryNotes: [],
  proformaInvoices: [],
  workCompletions: [],
  loading: false,
  error: null,
};

// Quotes
export const fetchQuotes = createAsyncThunk('sales/fetchQuotes', async (params = {}) => {
  const response = await axios.get('/admin/quotes', { params });
  return response.data.data.documents;
});

export const createQuote = createAsyncThunk('sales/createQuote', async (data) => {
  const response = await axios.post('/admin/quotes', data);
  return response.data.data.document;
});

// Sales Orders
export const fetchSalesOrders = createAsyncThunk('sales/fetchOrders', async (params = {}) => {
  const response = await axios.get('/admin/sales-orders', { params });
  return response.data.data.documents;
});

export const createSalesOrder = createAsyncThunk('sales/createOrder', async (data) => {
  const response = await axios.post('/admin/sales-orders', data);
  return response.data.data.document;
});

// Sales Invoices
export const fetchSalesInvoices = createAsyncThunk('sales/fetchInvoices', async (params = {}) => {
  const response = await axios.get('/admin/sales-invoices', { params });
  return response.data.data.documents;
});

export const createSalesInvoice = createAsyncThunk('sales/createInvoice', async (data) => {
  const response = await axios.post('/admin/sales-invoices', data);
  return response.data.data.document;
});

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotes.pending, (state) => { state.loading = true; })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.loading = false;
        state.quotes = action.payload;
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.quotes.unshift(action.payload);
      })
      .addCase(fetchSalesOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(createSalesOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })
      .addCase(fetchSalesInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload;
      })
      .addCase(createSalesInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload);
      });
  },
});

export const { clearError } = salesSlice.actions;
export default salesSlice.reducer;

