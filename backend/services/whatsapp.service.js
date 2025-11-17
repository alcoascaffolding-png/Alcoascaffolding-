/**
 * WhatsApp Service
 * Handles sending WhatsApp messages with PDF attachments using Twilio
 */

const twilio = require('twilio');
const logger = require('../utils/logger');
const { generateQuotationPDFBuffer } = require('../utils/playwrightPDFGenerator');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886
  }

  /**
   * Get or create Twilio client
   */
  getTwilioClient() {
    if (!this.client) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (!accountSid || !authToken) {
        throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be configured');
      }

      this.client = twilio(accountSid, authToken);
      logger.info('✅ Twilio WhatsApp client initialized successfully');
    }
    return this.client;
  }

  /**
   * Format phone number for WhatsApp (must include country code)
   * @param {string} phoneNumber - Phone number to format
   * @returns {string} - Formatted WhatsApp number
   */
  formatWhatsAppNumber(phoneNumber) {
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // If number doesn't start with country code, assume UAE (+971)
    if (!cleaned.startsWith('971') && cleaned.length <= 9) {
      cleaned = '971' + cleaned;
    }

    // Ensure it starts with country code
    if (!cleaned.startsWith('971')) {
      // Try to detect country code or default to UAE
      cleaned = '971' + cleaned.slice(-9);
    }

    // Format as WhatsApp number
    return `whatsapp:+${cleaned}`;
  }


  /**
   * Send WhatsApp message with PDF via URL (recommended approach)
   * @param {string} toPhoneNumber - Recipient phone number
   * @param {string} message - Message text
   * @param {string} pdfUrl - Public URL to PDF file
   * @returns {Promise<Object>} - Result of message sending
   */
  async sendMessageWithPDFUrl(toPhoneNumber, message, pdfUrl) {
    try {
      const client = this.getTwilioClient();

      if (!this.fromNumber) {
        throw new Error('TWILIO_WHATSAPP_NUMBER is not configured');
      }

      const formattedTo = this.formatWhatsAppNumber(toPhoneNumber);
      const formattedFrom = this.fromNumber.startsWith('whatsapp:') 
        ? this.fromNumber 
        : `whatsapp:${this.fromNumber}`;

      // Ensure PDF URL is absolute and accessible
      if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
        throw new Error('PDF URL must be a full HTTP/HTTPS URL');
      }

      logger.info('📱 Sending WhatsApp message with PDF URL', {
        to: formattedTo,
        from: formattedFrom,
        pdfUrl: pdfUrl
      });

      // For WhatsApp, Twilio requires the media URL to be publicly accessible
      // The URL must return the file with proper Content-Type header
      // Send message with media URL - Twilio will fetch the file from this URL
      const messageResult = await client.messages.create({
        from: formattedFrom,
        to: formattedTo,
        body: message,
        mediaUrl: [pdfUrl]
      });

      logger.success('✅ WhatsApp message sent successfully with PDF', {
        messageSid: messageResult.sid,
        to: formattedTo,
        status: messageResult.status,
        pdfUrl: pdfUrl
      });

      return {
        success: true,
        messageSid: messageResult.sid,
        status: messageResult.status,
        data: messageResult
      };
    } catch (error) {
      logger.error('❌ Failed to send WhatsApp message', {
        error: error.message,
        code: error.code,
        pdfUrl: pdfUrl
      });
      throw error;
    }
  }

  /**
   * Send quotation PDF via WhatsApp
   * @param {Object} quotation - Quotation object with customer details
   * @param {string} pdfUrl - Public URL to the PDF (must be publicly accessible)
   * @returns {Promise<Object>} - Result of WhatsApp sending
   */
  async sendQuotationWhatsApp(quotation, pdfUrl) {
    try {
      const customerPhone = quotation.customerPhone || quotation.primaryPhone;
      
      if (!customerPhone) {
        throw new Error('Customer phone number is required for WhatsApp');
      }

      if (!pdfUrl) {
        throw new Error('PDF URL is required. The PDF must be accessible via a public URL.');
      }

      // Validate URL is publicly accessible (not localhost in production)
      if (process.env.NODE_ENV === 'production' && pdfUrl.includes('localhost')) {
        throw new Error('PDF URL must be publicly accessible. Localhost URLs are not allowed in production.');
      }

      logger.info('📋 Sending quotation via WhatsApp', { 
        quoteNumber: quotation.quoteNumber,
        pdfUrl: pdfUrl,
        customerPhone: customerPhone
      });

      // Create message
      const message = `📋 *Quotation ${quotation.quoteNumber}*\n\n` +
        `Dear ${quotation.customerName || 'Valued Customer'},\n\n` +
        `Thank you for your interest in our services. Please find attached your quotation.\n\n` +
        `*Quotation Details:*\n` +
        `• Quotation No: ${quotation.quoteNumber}\n` +
        `• Date: ${new Date(quotation.quoteDate).toLocaleDateString()}\n` +
        `• Total Amount: AED ${(quotation.totalAmount || 0).toLocaleString()}\n\n` +
        `Please review the attached PDF for complete details.\n\n` +
        `For any queries, contact us:\n` +
        `📞 +971 58 137 5601\n` +
        `📧 Sales@alcoascaffolding.com\n\n` +
        `Best Regards,\n` +
        `*ALCOA ALUMINIUM SCAFFOLDING*`;

      const result = await this.sendMessageWithPDFUrl(customerPhone, message, pdfUrl);

      logger.success('✅ Quotation sent via WhatsApp successfully', {
        quoteNumber: quotation.quoteNumber,
        messageSid: result.messageSid,
        sentTo: customerPhone,
        pdfUrl: pdfUrl
      });

      return {
        success: true,
        message: 'Quotation sent via WhatsApp successfully',
        messageSid: result.messageSid,
        status: result.status
      };
    } catch (error) {
      logger.error('❌ Failed to send quotation via WhatsApp', error);
      throw error;
    }
  }

  /**
   * Test WhatsApp configuration
   */
  async testWhatsAppConfig() {
    try {
      const client = this.getTwilioClient();
      
      if (!this.fromNumber) {
        return {
          success: false,
          message: 'TWILIO_WHATSAPP_NUMBER is not configured'
        };
      }

      // Try to fetch account info to verify credentials
      const account = await client.api.accounts(client.accountSid).fetch();

      logger.success('✅ Twilio WhatsApp configuration test successful', {
        accountSid: account.sid,
        fromNumber: this.fromNumber
      });

      return {
        success: true,
        message: 'Twilio WhatsApp configuration is valid!',
        accountSid: account.sid,
        fromNumber: this.fromNumber
      };
    } catch (error) {
      logger.error('❌ Twilio WhatsApp configuration test failed', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = new WhatsAppService();

