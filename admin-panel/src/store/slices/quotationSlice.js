/**
 * Quotation Redux Slice
 * Manages quotation state in the admin panel
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quotationService from '../../services/api/quotationService';
import toast from 'react-hot-toast';

// Async thunks
export const fetchQuotations = createAsyncThunk(
  'quotations/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await quotationService.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quotations');
    }
  }
);

export const fetchQuotationById = createAsyncThunk(
  'quotations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await quotationService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quotation');
    }
  }
);

export const fetchQuotationStats = createAsyncThunk(
  'quotations/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await quotationService.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const createQuotation = createAsyncThunk(
  'quotations/create',
  async (quotationData, { rejectWithValue }) => {
    try {
      const response = await quotationService.create(quotationData);
      toast.success('Quotation created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create quotation';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateQuotation = createAsyncThunk(
  'quotations/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await quotationService.update(id, data);
      toast.success('Quotation updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update quotation';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteQuotation = createAsyncThunk(
  'quotations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await quotationService.delete(id);
      toast.success('Quotation deleted successfully!');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete quotation';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  quotations: [],
  selectedQuotation: null,
  stats: {
    total: 0,
    totalValue: 0,
    approved: 0,
    approvedValue: 0,
    thisMonth: {
      count: 0,
      value: 0
    },
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
    quoteType: '',
    customer: '',
    search: ''
  }
};

// Slice
const quotationSlice = createSlice({
  name: 'quotations',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedQuotation: (state, action) => {
      state.selectedQuotation = action.payload;
    },
    clearSelectedQuotation: (state) => {
      state.selectedQuotation = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch quotations
    builder
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch quotation by ID
    builder
      .addCase(fetchQuotationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedQuotation = action.payload;
      })
      .addCase(fetchQuotationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch statistics
    builder
      .addCase(fetchQuotationStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchQuotationStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchQuotationStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });

    // Create quotation
    builder
      .addCase(createQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update quotation
    builder
      .addCase(updateQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuotation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.quotations.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.quotations[index] = action.payload;
        }
        if (state.selectedQuotation?._id === action.payload._id) {
          state.selectedQuotation = action.payload;
        }
      })
      .addCase(updateQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete quotation
    builder
      .addCase(deleteQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations = state.quotations.filter(q => q._id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedQuotation?._id === action.payload) {
          state.selectedQuotation = null;
        }
      })
      .addCase(deleteQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setSelectedQuotation,
  clearSelectedQuotation,
  clearError
} = quotationSlice.actions;

export default quotationSlice.reducer;

