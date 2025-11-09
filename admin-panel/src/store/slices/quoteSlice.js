/**
 * Quote Redux Slice with API Integration
 */

import createResourceSlice from '../sliceFactory';
import { quoteService } from '../../services/api';

const quoteSlice = createResourceSlice('quotes', quoteService);

export const {
  fetchAll: fetchQuotes,
  fetchById: fetchQuoteById,
  fetchStats: fetchQuoteStats,
  create: createQuote,
  update: updateQuote,
  delete: deleteQuote
} = quoteSlice.actions;

export const { clearError, clearCurrentItem } = quoteSlice.actions;

export default quoteSlice.reducer;

