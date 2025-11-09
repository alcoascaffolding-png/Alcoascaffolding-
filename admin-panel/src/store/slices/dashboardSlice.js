/**
 * Dashboard Redux Slice with API Integration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../services/api';

// Async thunks for API calls
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchSalesOverview = createAsyncThunk(
  'dashboard/fetchSalesOverview',
  async (period = '6months', { rejectWithValue }) => {
    try {
      const response = await dashboardService.getSalesOverview(period);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales overview');
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentActivities(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent activities');
    }
  }
);

export const fetchTopCustomers = createAsyncThunk(
  'dashboard/fetchTopCustomers',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getTopCustomers(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top customers');
    }
  }
);

export const fetchPendingInvoices = createAsyncThunk(
  'dashboard/fetchPendingInvoices',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getPendingInvoices(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending invoices');
    }
  }
);

// Initial state
const initialState = {
  stats: {
    customers: {
      total: 0,
      active: 0,
      outstanding: 0
    },
    quotes: {
      total: 0,
      accepted: 0,
      pending: 0,
      value: 0
    },
    orders: {
      total: 0,
      pending: 0,
      delivered: 0
    },
    invoices: {
      total: 0,
      paid: 0,
      overdue: 0,
      totalValue: 0,
      collected: 0,
      outstanding: 0
    },
    revenue: {
      monthly: 0,
      annual: 0
    }
  },
  salesOverview: [],
  recentActivities: {
    orders: [],
    invoices: []
  },
  topCustomers: [],
  pendingInvoices: [],
  loading: false,
  error: null
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch sales overview
      .addCase(fetchSalesOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.salesOverview = action.payload.data;
      })
      .addCase(fetchSalesOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch recent activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.recentActivities = action.payload.data;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch top customers
      .addCase(fetchTopCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.topCustomers = action.payload.data;
      })
      .addCase(fetchTopCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch pending invoices
      .addCase(fetchPendingInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingInvoices = action.payload.data;
      })
      .addCase(fetchPendingInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
