/**
 * Email Service
 * Handles all email sending logic
 */

const { createTransporter, recipients, senderInfo } = require('../config/email.config');
const {
  contactCompanyTemplate,
  contactCustomerTemplate,
  quoteCompanyTemplate,
  quoteCustomerTemplate
} = require('../utils/emailTemplates');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  /**
   * Get or create email transporter
   */
  getTransporter() {
    if (!this.transporter) {
      this.transporter = createTransporter();
    }
    return this.transporter;
  }

  /**
   * Send email helper function with retry logic
   */
  async sendEmail(mailOptions, retries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const transporter = this.getTransporter();
        
        // Enhanced email options with proper headers
        const enhancedOptions = {
          ...mailOptions,
          from: senderInfo.from,
          replyTo: mailOptions.replyTo || senderInfo.replyTo,
          // Add headers to improve deliverability
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high',
            'X-Mailer': 'Alcoa Scaffolding Email Service',
            ...mailOptions.headers
          }
        };
        
        logger.info(`Sending email (attempt ${attempt}/${retries})`, {
          to: mailOptions.to,
          subject: mailOptions.subject
        });
        
        const info = await transporter.sendMail(enhancedOptions);
        
        logger.success('Email sent successfully', {
          messageId: info.messageId,
          to: mailOptions.to,
          subject: mailOptions.subject,
          attempt: attempt
        });
        
        return info;
      } catch (error) {
        lastError = error;
        logger.warn(`Email send attempt ${attempt}/${retries} failed`, {
          error: error.message,
          to: mailOptions.to
        });
        
        // If not the last attempt, wait before retrying
        if (attempt < retries) {
          const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s
          logger.info(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Reset transporter for next attempt
          this.transporter = null;
        }
      }
    }
    
    // All retries failed
    logger.error('All email send attempts failed', lastError);
    throw lastError;
  }

  /**
   * Send contact form emails
   * @param {Object} data - Contact form data
   * @returns {Promise<Object>} - Result of email sending
   */
  async sendContactFormEmail(data) {
    try {
      logger.info('Processing contact form email', { email: data.email });

      // Email to company
      const companyMailOptions = {
        to: recipients.primary,
        subject: `🔔 New Contact Form Submission from ${data.name}`,
        html: contactCompanyTemplate(data),
        replyTo: data.email, // Reply to customer's email
        headers: {
          'X-Entity-Ref-ID': `contact-${Date.now()}`,
          'X-Customer-Email': data.email
        }
      };

      // Auto-reply to customer
      const customerMailOptions = {
        to: data.email,
        subject: 'Thank You for Contacting Alcoa Aluminium Scaffolding',
        html: contactCustomerTemplate(data),
        replyTo: recipients.primary, // Customer can reply to company
        // Add text version for better deliverability
        text: `Dear ${data.name},\n\nThank you for contacting Alcoa Aluminium Scaffolding. We have received your message and our team will get back to you within 2 hours.\n\nYour Message:\n${data.message}\n\nNeed Immediate Assistance?\nPhone: +971 58 137 5601\nEmail: Sales@alcoascaffolding.com\nAddress: Musaffah, Abu Dhabi, UAE\n\nBest Regards,\nAlcoa Aluminium Scaffolding Team`,
        headers: {
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'Auto-Submitted': 'auto-replied',
          'X-Entity-Ref-ID': `contact-reply-${Date.now()}`
        }
      };

      // Send both emails
      await Promise.all([
        this.sendEmail(companyMailOptions),
        this.sendEmail(customerMailOptions)
      ]);

      logger.emailSent('Contact Form', `${recipients.primary}, ${data.email}`, {
        name: data.name,
        projectType: data.projectType
      });

      return {
        success: true,
        message: 'Email sent successfully. We will contact you within 2 hours.'
      };
    } catch (error) {
      logger.emailError('Contact Form', error, { email: data.email });
      // Pass the actual error details for better debugging
      const errorMessage = error.message || 'Failed to send contact form email';
      const errorDetails = {
        message: errorMessage,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      };
      const detailedError = new Error('Failed to send contact form email');
      detailedError.details = errorDetails;
      throw detailedError;
    }
  }

  /**
   * Send quote request emails
   * @param {Object} data - Quote form data
   * @returns {Promise<Object>} - Result of email sending
   */
  async sendQuoteRequestEmail(data) {
    try {
      logger.info('Processing quote request email', { email: data.email });

      // Email to company
      const companyMailOptions = {
        to: recipients.primary,
        subject: `💰 New Quote Request from ${data.name}`,
        html: quoteCompanyTemplate(data),
        replyTo: data.email, // Reply to customer's email
        headers: {
          'X-Entity-Ref-ID': `quote-${Date.now()}`,
          'X-Customer-Email': data.email
        }
      };

      // Auto-reply to customer
      const customerMailOptions = {
        to: data.email,
        subject: 'Your Quote Request - Alcoa Aluminium Scaffolding',
        html: quoteCustomerTemplate(data),
        replyTo: recipients.primary, // Customer can reply to company
        // Add text version for better deliverability
        text: `Dear ${data.name},\n\nThank you for your quote request. We have received your project details and our team is reviewing them.\n\nYou will receive a detailed quotation within 24 hours.\n\nNeed Immediate Assistance?\nPhone: +971 58 137 5601\nEmail: Sales@alcoascaffolding.com\nAddress: Musaffah, Abu Dhabi, UAE\nBusiness Hours: Mon-Fri 7AM-6PM, Sat 8AM-4PM\n\nBest Regards,\nAlcoa Aluminium Scaffolding Team`,
        headers: {
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'Auto-Submitted': 'auto-replied',
          'X-Entity-Ref-ID': `quote-reply-${Date.now()}`
        }
      };

      // Send both emails
      await Promise.all([
        this.sendEmail(companyMailOptions),
        this.sendEmail(customerMailOptions)
      ]);

      logger.emailSent('Quote Request', `${recipients.primary}, ${data.email}`, {
        name: data.name,
        projectHeight: data.projectHeight,
        coverageArea: data.coverageArea
      });

      return {
        success: true,
        message: 'Quote request sent successfully. We will send you a quote within 24 hours.'
      };
    } catch (error) {
      logger.emailError('Quote Request', error, { email: data.email });
      // Pass the actual error details for better debugging
      const errorMessage = error.message || 'Failed to send quote request email';
      const errorDetails = {
        message: errorMessage,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      };
      const detailedError = new Error('Failed to send quote request email');
      detailedError.details = errorDetails;
      throw detailedError;
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfig() {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      logger.success('Email configuration is valid');
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      logger.error('Email configuration test failed', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();

