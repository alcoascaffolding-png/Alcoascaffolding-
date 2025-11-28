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
const setupRoutes = require('./routes/setup.routes');

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

// Serve static files for quotation PDFs with proper headers
const path = require('path');
app.use('/quotation-pdfs', express.static(path.join(__dirname, 'public/quotation-pdfs'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="quotation.pdf"');
      // Allow CORS for Twilio to fetch the file
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    }
  }
}));

// Request logging
if (config.server.env === 'development') {
  app.use(requestLogger);
}

// Security middleware
app.use(sanitizeRequest);
app.use(detectSuspiciousActivity);

// Routes (moved before rate limiter for better control)
// Setup routes (no auth required - for initial setup only!)
app.use('/api/setup', setupRoutes);

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
app.get('/api/health', async (req, res) => {
  const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  
  // Check Playwright browser installation
  let playwrightStatus = 'unknown';
  try {
    const { verifyBrowserInstallation } = require('./utils/playwrightPDFGenerator');
    const isInstalled = await verifyBrowserInstallation();
    playwrightStatus = isInstalled ? 'installed' : 'not_installed';
  } catch (error) {
    playwrightStatus = 'error';
    console.error('Health check - Playwright verification failed:', error.message);
  }
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'Alcoa Scaffolding API is running',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    emailConfigured: emailConfigured,
    playwright: playwrightStatus,
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

// Start server with Playwright browser check
let server;
const startServer = async () => {
  // Check and install Playwright browsers if needed (non-blocking)
  if (config.server.env === 'production') {
    const { ensureBrowserInstalled } = require('./utils/playwrightPDFGenerator');
    ensureBrowserInstalled().catch(err => {
      console.error('[Startup] Failed to ensure Playwright browsers:', err.message);
      // Don't block server startup, but log the error
    });
  }
  
  server = app.listen(PORT, () => {
    logger.serverStarted(PORT, config.server.env);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${PORT} is already in use.`);
      logger.error('💡 To fix this, run one of the following:');
      logger.error(`   Windows: netstat -ano | findstr :${PORT} (then taskkill /PID <PID> /F)`);
      logger.error(`   Or use: .\\kill-port.ps1 ${PORT}`);
      logger.error(`   Mac/Linux: lsof -ti:${PORT} | xargs kill -9`);
      process.exit(1);
    } else {
      logger.error('❌ Server error:', err);
      process.exit(1);
    }
  });
  
  return server;
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;

