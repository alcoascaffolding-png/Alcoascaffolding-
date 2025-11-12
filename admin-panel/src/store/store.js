/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import dashboardReducer from './slices/dashboardSlice';
import quoteReducer from './slices/quoteSlice';
import salesOrderReducer from './slices/salesOrderSlice';
import salesInvoiceReducer from './slices/salesInvoiceSlice';
import vendorReducer from './slices/vendorSlice';
import productReducer from './slices/productSlice';
import purchaseOrderReducer from './slices/purchaseOrderSlice';
import purchaseInvoiceReducer from './slices/purchaseInvoiceSlice';
import stockAdjustmentReducer from './slices/stockAdjustmentSlice';
import bankAccountReducer from './slices/bankAccountSlice';
import receiptReducer from './slices/receiptSlice';
import paymentReducer from './slices/paymentSlice';
import contactMessageReducer from './slices/contactMessageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    dashboard: dashboardReducer,
    quotes: quoteReducer,
    salesOrders: salesOrderReducer,
    salesInvoices: salesInvoiceReducer,
    vendors: vendorReducer,
    products: productReducer,
    purchaseOrders: purchaseOrderReducer,
    purchaseInvoices: purchaseInvoiceReducer,
    stockAdjustments: stockAdjustmentReducer,
    bankAccounts: bankAccountReducer,
    receipts: receiptReducer,
    payments: paymentReducer,
    contactMessages: contactMessageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

