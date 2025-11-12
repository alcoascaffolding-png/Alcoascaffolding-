/**
 * Customer Routes
 * API endpoints for customer management
 */

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// All routes require authentication
router.use(authenticate);

// Check for new customers (lightweight polling endpoint)
router.get('/check-new', asyncHandler(customerController.checkForNew.bind(customerController)));

// Get statistics
router.get('/stats', asyncHandler(customerController.getStatistics.bind(customerController)));

// CRUD operations
router.get('/', asyncHandler(customerController.getAllCustomers.bind(customerController)));
router.get('/:id', asyncHandler(customerController.getCustomerById.bind(customerController)));
router.post('/', asyncHandler(customerController.createCustomer.bind(customerController)));
router.patch('/:id', asyncHandler(customerController.updateCustomer.bind(customerController)));
router.delete('/:id', asyncHandler(customerController.deleteCustomer.bind(customerController)));

// Contact persons management
router.post('/:id/contacts', asyncHandler(customerController.addContactPerson.bind(customerController)));
router.patch('/:id/contacts/:contactId', asyncHandler(customerController.updateContactPerson.bind(customerController)));
router.delete('/:id/contacts/:contactId', asyncHandler(customerController.deleteContactPerson.bind(customerController)));

// Addresses management
router.post('/:id/addresses', asyncHandler(customerController.addAddress.bind(customerController)));
router.patch('/:id/addresses/:addressId', asyncHandler(customerController.updateAddress.bind(customerController)));
router.delete('/:id/addresses/:addressId', asyncHandler(customerController.deleteAddress.bind(customerController)));

module.exports = router;
