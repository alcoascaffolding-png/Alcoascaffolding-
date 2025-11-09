/**
 * Customer Redux Slice with API Integration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerService } from '../../services/api';

// Async thunks for API calls
export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await customerService.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
    }
  }
);

export const fetchCustomerStats = createAsyncThunk(
  'customers/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer stats');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await customerService.create(customerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await customerService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerService.delete(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
    }
  }
);

// Initial state
const initialState = {
  customers: [],
  currentCustomer: null,
  stats: {
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    totalCreditLimit: 0,
    totalOutstanding: 0
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null
};

// Customer slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload.data;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch customer stats
      .addCase(fetchCustomerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload.data);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(c => c._id === action.payload.data._id);
        if (index !== -1) {
          state.customers[index] = action.payload.data;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(c => c._id !== action.payload.id);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentCustomer } = customerSlice.actions;

export default customerSlice.reducer;
