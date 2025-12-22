/**
 * Contact Message Routes - OPTIMIZED VERSION
 * Added: Change detection endpoint, ETag support
 */

const express = require('express');
const router = express.Router();
const contactMessageController = require('../controllers/contactMessage.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/contact-messages/check-new
 * @desc    Lightweight endpoint to check if new messages exist
 * @access  Private
 * @returns {hasNew: boolean, newCount: number} - Minimal response
 */
router.get('/check-new', asyncHandler(contactMessageController.checkForNew.bind(contactMessageController)));

/**
 * @route   GET /api/contact-messages/stats
 * @desc    Get contact message statistics (cached)
 * @access  Private
 */
router.get('/stats', asyncHandler(contactMessageController.getStats.bind(contactMessageController)));

/**
 * @route   GET /api/contact-messages
 * @desc    Get all contact messages (with ETag support)
 * @access  Private
 */
router.get('/', asyncHandler(contactMessageController.getAllMessages.bind(contactMessageController)));

/**
 * @route   GET /api/contact-messages/:id
 * @desc    Get single contact message
 * @access  Private
 */
router.get('/:id', asyncHandler(contactMessageController.getMessageById.bind(contactMessageController)));

/**
 * @route   PATCH /api/contact-messages/:id
 * @desc    Update contact message
 * @access  Private
 */
router.patch('/:id', asyncHandler(contactMessageController.updateMessage.bind(contactMessageController)));

/**
 * @route   DELETE /api/contact-messages/:id
 * @desc    Delete contact message
 * @access  Private
 */
router.delete('/:id', asyncHandler(contactMessageController.deleteMessage.bind(contactMessageController)));

/**
 * @route   POST /api/contact-messages/bulk-update
 * @desc    Bulk update messages
 * @access  Private
 */
router.post('/bulk-update', asyncHandler(contactMessageController.bulkUpdate.bind(contactMessageController)));

module.exports = router;

