/**
 * Customer Routes - Full CRUD Operations
 */

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, restrictTo } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// Apply optional authentication (dev mode friendly)
router.use(optionalAuth);

// GET routes
router.get('/', customerController.getAllCustomers);
router.get('/stats', customerController.getCustomerStats);
router.get('/outstanding', customerController.getOutstanding);
router.get('/:id', customerController.getCustomerById);

// POST routes
router.post('/', customerController.createCustomer);

// PUT routes
router.put('/:id', customerController.updateCustomer);

// DELETE routes
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;

