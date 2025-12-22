/**
 * Email Routes
 * Defines routes for email-related endpoints
 */

const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/email/send-contact
 * @desc    Send contact form email
 * @access  Public (rate limited)
 */
router.post('/send-contact', asyncHandler(emailController.sendContact.bind(emailController)));

/**
 * @route   POST /api/email/send-quote
 * @desc    Send quote request email
 * @access  Public (rate limited)
 */
router.post('/send-quote', asyncHandler(emailController.sendQuote.bind(emailController)));

/**
 * @route   GET/POST /api/email/test
 * @desc    Test email configuration
 * @access  Development only
 */
router.get('/test', asyncHandler(emailController.testEmail.bind(emailController)));
router.post('/test', asyncHandler(emailController.testEmail.bind(emailController)));

module.exports = router;

