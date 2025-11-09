require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import configurations
const config = require('./config/app.config');
const logger = require('./utils/logger');
const connectDB = require('./config/database');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter, emailLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const { sanitizeRequest, detectSuspiciousActivity, handleCORS } = require('./middleware/security');

// Import routes
const emailRoutes = require('./routes/email.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const customerRoutes = require('./routes/customer.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const quoteRoutes = require('./routes/quote.routes');
const salesOrderRoutes = require('./routes/salesOrder.routes');
const salesInvoiceRoutes = require('./routes/salesInvoice.routes');
const vendorRoutes = require('./routes/vendor.routes');
const productRoutes = require('./routes/product.routes');
const purchaseOrderRoutes = require('./routes/purchaseOrder.routes');
const purchaseInvoiceRoutes = require('./routes/purchaseInvoice.routes');
const stockAdjustmentRoutes = require('./routes/stockAdjustment.routes');
const bankAccountRoutes = require('./routes/bankAccount.routes');
const receiptRoutes = require('./routes/receipt.routes');
const paymentRoutes = require('./routes/payment.routes');
const contactMessageRoutes = require('./routes/contactMessage.routes');

const app = express();
const PORT = config.server.port;

// Connect to MongoDB
connectDB();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet(config.security.helmet));

// CORS configuration
app.use(cors(config.cors));
app.use(handleCORS);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.server.env === 'development') {
  app.use(requestLogger);
}

// Security middleware
app.use(sanitizeRequest);
app.use(detectSuspiciousActivity);

// Routes (moved before rate limiter for better control)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Customer Relations
app.use('/api/customers', customerRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/sales-invoices', salesInvoiceRoutes);

// Vendor Relations
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/purchase-invoices', purchaseInvoiceRoutes);

// Inventory
app.use('/api/products', productRoutes);
app.use('/api/stock-adjustments', stockAdjustmentRoutes);

// Accounts
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/payments', paymentRoutes);

// Dashboard
app.use('/api/dashboard', dashboardRoutes);

// Contact Messages
app.use('/api/contact-messages', contactMessageRoutes);

// Apply rate limiting only to specific routes
app.use('/api/email', emailLimiter, emailRoutes);

// General API rate limiting (less strict, after specific routes)
if (config.server.env === 'production') {
  app.use('/api/', apiLimiter);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'Alcoa Scaffolding API is running',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    emailConfigured: emailConfigured,
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Alcoa Scaffolding API',
    version: '1.0.0',
    environment: config.server.env,
    endpoints: {
      health: 'GET /api/health',
      auth: '/api/auth',
      admin: '/api/admin',
      sendContact: 'POST /api/email/send-contact',
      sendQuote: 'POST /api/email/send-quote',
      ...(config.server.env === 'development' && { testEmail: 'GET /api/email/test' })
    },
    documentation: 'https://github.com/alcoa-scaffolding/api-docs'
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.serverStarted(PORT, config.server.env);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;

