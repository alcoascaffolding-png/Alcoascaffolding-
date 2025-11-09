/**
 * Redux Slice Factory
 * Generate Redux slices with API integration for any resource
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const createResourceSlice = (resourceName, apiService) => {
  // Create async thunks
  const fetchAll = createAsyncThunk(
    `${resourceName}/fetchAll`,
    async (params, { rejectWithValue }) => {
      try {
        const response = await apiService.getAll(params);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || `Failed to fetch ${resourceName}`);
      }
    }
  );

  const fetchById = createAsyncThunk(
    `${resourceName}/fetchById`,
    async (id, { rejectWithValue }) => {
      try {
        const response = await apiService.getById(id);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || `Failed to fetch ${resourceName}`);
      }
    }
  );

  const fetchStats = createAsyncThunk(
    `${resourceName}/fetchStats`,
    async (_, { rejectWithValue }) => {
      try {
        const response = await apiService.getStats();
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || `Failed to fetch ${resourceName} stats`);
      }
    }
  );

  const create = createAsyncThunk(
    `${resourceName}/create`,
    async (data, { rejectWithValue }) => {
      try {
        const response = await apiService.create(data);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || `Failed to create ${resourceName}`);
      }
    }
  );

  const update = createAsyncThunk(
    `${resourceName}/update`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const response = await apiService.update(id, data);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || `Failed to update ${resourceName}`);
      }
    }
  );

  const remove = createAsyncThunk(
    `${resourceName}/delete`,
    async (id, { rejectWithValue }) => {
      try {
        const response = await apiService.delete(id);
        return { id, ...response };
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || `Failed to delete ${resourceName}`);
      }
    }
  );

  // Initial state
  const initialState = {
    items: [],
    currentItem: null,
    stats: {},
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    loading: false,
    error: null
  };

  // Create slice
  const slice = createSlice({
    name: resourceName,
    initialState,
    reducers: {
      clearError: (state) => {
        state.error = null;
      },
      clearCurrentItem: (state) => {
        state.currentItem = null;
      }
    },
    extraReducers: (builder) => {
      builder
        // Fetch all
        .addCase(fetchAll.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchAll.fulfilled, (state, action) => {
          state.loading = false;
          state.items = action.payload.data;
          state.pagination = action.payload.pagination || state.pagination;
        })
        .addCase(fetchAll.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })

        // Fetch by ID
        .addCase(fetchById.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchById.fulfilled, (state, action) => {
          state.loading = false;
          state.currentItem = action.payload.data;
        })
        .addCase(fetchById.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })

        // Fetch stats
        .addCase(fetchStats.fulfilled, (state, action) => {
          state.stats = action.payload.data;
        })

        // Create
        .addCase(create.fulfilled, (state, action) => {
          state.items.unshift(action.payload.data);
        })

        // Update
        .addCase(update.fulfilled, (state, action) => {
          const index = state.items.findIndex(item => item._id === action.payload.data._id);
          if (index !== -1) {
            state.items[index] = action.payload.data;
          }
        })

        // Delete
        .addCase(remove.fulfilled, (state, action) => {
          state.items = state.items.filter(item => item._id !== action.payload.id);
        });
    }
  });

  return {
    reducer: slice.reducer,
    actions: {
      ...slice.actions,
      fetchAll,
      fetchById,
      fetchStats,
      create,
      update,
      delete: remove
    }
  };
};

export default createResourceSlice;

