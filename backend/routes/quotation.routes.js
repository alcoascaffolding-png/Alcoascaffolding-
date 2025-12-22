/**
 * Quotation Routes
 * API endpoints for quotation management
 */

const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// All routes require authentication
router.use(authenticate);

// Check for new quotations (lightweight polling)
router.get('/check-new', asyncHandler(quotationController.checkForNew.bind(quotationController)));

// Get statistics
router.get('/stats', asyncHandler(quotationController.getStatistics.bind(quotationController)));

// CRUD operations
router.get('/', asyncHandler(quotationController.getAllQuotations.bind(quotationController)));
router.get('/:id', asyncHandler(quotationController.getQuotationById.bind(quotationController)));
router.post('/', asyncHandler(quotationController.createQuotation.bind(quotationController)));
router.patch('/:id', asyncHandler(quotationController.updateQuotation.bind(quotationController)));
router.delete('/:id', asyncHandler(quotationController.deleteQuotation.bind(quotationController)));

module.exports = router;

