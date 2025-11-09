/**
 * Auth Slice
 * Authentication state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Load user from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const initialState = {
  user: user || null,
  token: token || null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { user, token, refreshToken } = response.data.data;
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('/auth/logout');
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      return null;
    } catch (error) {
      // Even if API call fails, clear local data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      return null;
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/auth/me');
      const { user } = response.data.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.put('/auth/update-profile', data);
      const { user } = response.data.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Get Me
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

