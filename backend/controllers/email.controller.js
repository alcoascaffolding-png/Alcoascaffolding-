/**
 * Email Controller
 * Handles HTTP requests for email-related endpoints
 */

// Force Resend service for production deployment
let emailService;
try {
  const resendService = require('../services/resend.service');
  emailService = resendService;
  console.log('✅ Using Resend Email Service');
} catch (error) {
  console.error('❌ Failed to load Resend service:', error.message);
  throw new Error('Resend service is required for deployment');
}

const { validateContactForm, validateQuoteForm } = require('../validators/email.validator');
const logger = require('../utils/logger');
const ContactMessage = require('../models/ContactMessage');

class EmailController {
  /**
   * Send contact form email
   * POST /api/email/send-contact
   */
  async sendContact(req, res, next) {
    try {
      logger.apiRequest('POST', '/api/email/send-contact', req.ip);
      
      // Validate input
      const validation = validateContactForm(req.body);
      
      if (!validation.isValid) {
        logger.warn('Contact form validation failed', { errors: validation.errors });
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Save message to database
      const contactMessage = new ContactMessage({
        type: 'contact',
        ...validation.sanitizedData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        emailSent: false
      });

      await contactMessage.save();
      logger.info('Contact message saved to database', { id: contactMessage._id });

      // Send email
      const result = await emailService.sendContactFormEmail(validation.sanitizedData);

      // Update email status
      contactMessage.emailSent = true;
      contactMessage.emailSentAt = new Date();
      await contactMessage.save();

      res.status(200).json({ 
        ...result, 
        messageId: contactMessage._id 
      });
    } catch (error) {
      logger.error('Contact form error', error);
      // Pass error details to error handler
      error.statusCode = 500;
      error.isOperational = true;
      next(error);
    }
  }

  /**
   * Send quote request email
   * POST /api/email/send-quote
   */
  async sendQuote(req, res, next) {
    try {
      logger.apiRequest('POST', '/api/email/send-quote', req.ip);
      
      // Validate input
      const validation = validateQuoteForm(req.body);
      
      if (!validation.isValid) {
        logger.warn('Quote form validation failed', { errors: validation.errors });
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Save message to database
      const contactMessage = new ContactMessage({
        type: 'quote',
        ...validation.sanitizedData,
        priority: 'high', // Quote requests are typically high priority
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        emailSent: false
      });

      await contactMessage.save();
      logger.info('Quote request saved to database', { id: contactMessage._id });

      // Send email
      const result = await emailService.sendQuoteRequestEmail(validation.sanitizedData);

      // Update email status
      contactMessage.emailSent = true;
      contactMessage.emailSentAt = new Date();
      await contactMessage.save();

      res.status(200).json({ 
        ...result, 
        messageId: contactMessage._id 
      });
    } catch (error) {
      logger.error('Quote request error', error);
      // Pass error details to error handler
      error.statusCode = 500;
      error.isOperational = true;
      next(error);
    }
  }

  /**
   * Test email configuration
   * GET /api/email/test (only in development)
   */
  async testEmail(req, res, next) {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          error: 'This endpoint is only available in development mode'
        });
      }

      const result = await emailService.testEmailConfig();
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      logger.error('Email test error', error);
      next(error);
    }
  }
}

module.exports = new EmailController();

