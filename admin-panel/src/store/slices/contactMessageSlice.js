/**
 * Contact Message Redux Slice with API Integration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contactMessageService } from '../../services/api';

// Async thunks for API calls
export const fetchContactMessages = createAsyncThunk(
  'contactMessages/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await contactMessageService.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contact messages');
    }
  }
);

export const fetchContactMessageById = createAsyncThunk(
  'contactMessages/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contactMessageService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contact message');
    }
  }
);

export const fetchContactMessageStats = createAsyncThunk(
  'contactMessages/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactMessageService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contact message stats');
    }
  }
);

export const updateContactMessage = createAsyncThunk(
  'contactMessages/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await contactMessageService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update contact message');
    }
  }
);

export const deleteContactMessage = createAsyncThunk(
  'contactMessages/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contactMessageService.delete(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete contact message');
    }
  }
);

export const bulkUpdateContactMessages = createAsyncThunk(
  'contactMessages/bulkUpdate',
  async ({ ids, updates }, { rejectWithValue }) => {
    try {
      const response = await contactMessageService.bulkUpdate(ids, updates);
      return { ids, updates, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update messages');
    }
  }
);

// Initial state
const initialState = {
  messages: [],
  currentMessage: null,
  stats: {
    total: 0,
    byStatus: {},
    byType: {},
    byPriority: {},
    recent: []
  },
  filters: {
    statusCounts: {},
    typeCounts: {}
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

// Contact Message slice
const contactMessageSlice = createSlice({
  name: 'contactMessages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMessage: (state) => {
      state.currentMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all contact messages
      .addCase(fetchContactMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.data;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters || {};
      })
      .addCase(fetchContactMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch contact message by ID
      .addCase(fetchContactMessageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMessageById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMessage = action.payload.data;
      })
      .addCase(fetchContactMessageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch contact message stats
      .addCase(fetchContactMessageStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMessageStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchContactMessageStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update contact message
      .addCase(updateContactMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContactMessage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.messages.findIndex(m => m._id === action.payload.data._id);
        if (index !== -1) {
          state.messages[index] = action.payload.data;
        }
        if (state.currentMessage && state.currentMessage._id === action.payload.data._id) {
          state.currentMessage = action.payload.data;
        }
      })
      .addCase(updateContactMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete contact message
      .addCase(deleteContactMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContactMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = state.messages.filter(m => m._id !== action.payload.id);
      })
      .addCase(deleteContactMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk update contact messages
      .addCase(bulkUpdateContactMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateContactMessages.fulfilled, (state, action) => {
        state.loading = false;
        // Update messages in the state
        const { ids, updates } = action.payload;
        state.messages = state.messages.map(message => {
          if (ids.includes(message._id)) {
            return { ...message, ...updates };
          }
          return message;
        });
      })
      .addCase(bulkUpdateContactMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentMessage } = contactMessageSlice.actions;

export default contactMessageSlice.reducer;

