/**
 * Axios Configuration
 * Centralized API client with interceptors
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle specific error codes
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error(data.message || 'You do not have permission to perform this action.');
      } else if (status === 404) {
        toast.error(data.message || 'Resource not found.');
      } else if (status === 500) {
        toast.error(data.message || 'Server error. Please try again later.');
      } else {
        toast.error(data.message || 'An error occurred. Please try again.');
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

