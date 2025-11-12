/**
 * Customer Redux Slice
 * Manages customer state in the admin panel
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/api/customerService';
import toast from 'react-hot-toast';

// Async thunks
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
      return response.data;
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await customerService.create(customerData);
      toast.success('Customer created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create customer';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await customerService.update(id, data);
      toast.success('Customer updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update customer';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async ({ id, hard = false }, { rejectWithValue }) => {
    try {
      await customerService.delete(id, hard);
      toast.success(hard ? 'Customer deleted permanently!' : 'Customer deactivated!');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete customer';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addContactPerson = createAsyncThunk(
  'customers/addContact',
  async ({ customerId, contactData }, { rejectWithValue }) => {
    try {
      const response = await customerService.addContact(customerId, contactData);
      toast.success('Contact person added!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add contact';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateContactPerson = createAsyncThunk(
  'customers/updateContact',
  async ({ customerId, contactId, contactData }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateContact(customerId, contactId, contactData);
      toast.success('Contact person updated!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update contact';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteContactPerson = createAsyncThunk(
  'customers/deleteContact',
  async ({ customerId, contactId }, { rejectWithValue }) => {
    try {
      const response = await customerService.deleteContact(customerId, contactId);
      toast.success('Contact person deleted!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete contact';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addAddress = createAsyncThunk(
  'customers/addAddress',
  async ({ customerId, addressData }, { rejectWithValue }) => {
    try {
      const response = await customerService.addAddress(customerId, addressData);
      toast.success('Address added!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add address';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'customers/updateAddress',
  async ({ customerId, addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateAddress(customerId, addressId, addressData);
      toast.success('Address updated!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update address';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'customers/deleteAddress',
  async ({ customerId, addressId }, { rejectWithValue }) => {
    try {
      const response = await customerService.deleteAddress(customerId, addressId);
      toast.success('Address deleted!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete address';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  customers: [],
  selectedCustomer: null,
  stats: {
    total: 0,
    active: 0,
    totalRevenue: 0,
    totalOrders: 0,
    byStatus: {},
    byType: {}
  },
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    pages: 1
  },
  loading: false,
  statsLoading: false,
  error: null,
  filters: {
    status: '',
    customerType: '',
    businessType: '',
    priority: '',
    search: ''
  }
};

// Slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch customers
    builder
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
      });

    // Fetch customer by ID
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch statistics
    builder
      .addCase(fetchCustomerStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });

    // Create customer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update customer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete customer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(c => c._id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedCustomer?._id === action.payload) {
          state.selectedCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add/Update/Delete Contact Person
    builder
      .addCase(addContactPerson.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateContactPerson.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(deleteContactPerson.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload;
        }
      });

    // Add/Update/Delete Address
    builder
      .addCase(addAddress.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload;
        }
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setSelectedCustomer,
  clearSelectedCustomer,
  clearError
} = customerSlice.actions;

export default customerSlice.reducer;
