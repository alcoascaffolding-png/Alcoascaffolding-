/**
 * Dashboard Routes - Aggregated Stats & Metrics
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// Apply optional authentication (dev mode friendly)
router.use(optionalAuth);

// Dashboard stats
router.get('/stats', dashboardController.getDashboardStats);
router.get('/sales-overview', dashboardController.getSalesOverview);
router.get('/recent-activities', dashboardController.getRecentActivities);
router.get('/top-customers', dashboardController.getTopCustomers);
router.get('/pending-invoices', dashboardController.getPendingInvoices);

module.exports = router;

