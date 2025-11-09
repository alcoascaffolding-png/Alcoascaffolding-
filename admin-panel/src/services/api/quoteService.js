/**
 * Quote API Service
 */

import api from '../../api/axios';

const quoteService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/quotes', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/quotes/${id}`);
    return data;
  },
  getStats: async () => {
    const { data } = await api.get('/quotes/stats');
    return data;
  },
  create: async (quoteData) => {
    const { data } = await api.post('/quotes', quoteData);
    return data;
  },
  update: async (id, quoteData) => {
    const { data } = await api.put(`/quotes/${id}`, quoteData);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/quotes/${id}`);
    return data;
  }
};

export default quoteService;

