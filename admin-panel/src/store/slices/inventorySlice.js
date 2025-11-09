/**
 * Inventory Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
  adjustments: [],
  movements: [],
  loading: false,
  error: null,
};

export const fetchStockAdjustments = createAsyncThunk('inventory/fetchAdjustments', async (params = {}) => {
  const response = await axios.get('/admin/stock-adjustments', { params });
  return response.data.data.documents;
});

export const createStockAdjustment = createAsyncThunk('inventory/createAdjustment', async (data) => {
  const response = await axios.post('/admin/stock-adjustments', data);
  return response.data.data.document;
});

export const fetchStockMovements = createAsyncThunk('inventory/fetchMovements', async (params = {}) => {
  const response = await axios.get('/admin/stock-movements', { params });
  return response.data.data.documents;
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStockAdjustments.pending, (state) => { state.loading = true; })
      .addCase(fetchStockAdjustments.fulfilled, (state, action) => {
        state.loading = false;
        state.adjustments = action.payload;
      })
      .addCase(fetchStockAdjustments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createStockAdjustment.fulfilled, (state, action) => {
        state.adjustments.unshift(action.payload);
      })
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.movements = action.payload;
      });
  },
});

export const { clearError } = inventorySlice.actions;
export default inventorySlice.reducer;

