/**
 * Main App Component
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';

// Auth
import Login from './pages/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/customers/Customers';
import Quotations from './pages/quotations/Quotations';
import Vendors from './pages/vendors/Vendors';
import Products from './pages/products/Products';
import Quotes from './pages/sales/Quotes';
import SalesOrders from './pages/sales/SalesOrders';
import SalesInvoices from './pages/sales/SalesInvoices';
import PurchaseOrders from './pages/purchase/PurchaseOrders';
import PurchaseInvoices from './pages/purchase/PurchaseInvoices';
import StockAdjustments from './pages/inventory/StockAdjustments';
import BankAccounts from './pages/accounts/BankAccounts';
import Receipts from './pages/accounts/Receipts';
import Payments from './pages/accounts/Payments';
import ContactMessages from './pages/contactMessages/ContactMessages';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            
            {/* Contact Messages */}
            <Route path="contact-messages" element={<ContactMessages />} />
            
            {/* Customer Relations */}
            <Route path="customers" element={<Customers />} />
            <Route path="quotes" element={<Quotations />} />
            <Route path="sales-orders" element={<SalesOrders />} />
            <Route path="sales-invoices" element={<SalesInvoices />} />
            
            {/* Vendor Relations */}
            <Route path="vendors" element={<Vendors />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="purchase-invoices" element={<PurchaseInvoices />} />
            
            {/* Inventory */}
            <Route path="products" element={<Products />} />
            <Route path="stock-adjustments" element={<StockAdjustments />} />
            
            {/* Accounts */}
            <Route path="bank-accounts" element={<BankAccounts />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="payments" element={<Payments />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
