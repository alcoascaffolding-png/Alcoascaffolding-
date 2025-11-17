/**
 * Resend Email Service
 * Modern email service using Resend API
 */

const { Resend } = require('resend');
const {
  contactCompanyTemplate,
  contactCustomerTemplate,
  quoteCompanyTemplate,
  quoteCustomerTemplate
} = require('../utils/emailTemplates');
const logger = require('../utils/logger');

class ResendEmailService {
  constructor() {
    this.resend = null;
    // Use environment variable for from email (now that domain is verified)
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    // Must match the email registered with your Resend account
    this.companyEmail = process.env.COMPANY_EMAIL || 'sales@alcoascaffolding.com';
  }

  /**
   * Get or create Resend client
   */
  getResendClient() {
    if (!this.resend) {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
      }
      this.resend = new Resend(process.env.RESEND_API_KEY);
      logger.info('✅ Resend client initialized successfully');
    }
    return this.resend;
  }

  /**
   * Send email using Resend with retry logic
   */
  async sendEmail(emailOptions, retries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const resend = this.getResendClient();
        
        logger.info(`📧 Sending email via Resend (attempt ${attempt}/${retries})`, {
          to: emailOptions.to,
          subject: emailOptions.subject
        });
        
        const { data, error } = await resend.emails.send(emailOptions);
        
        if (error) {
          throw new Error(error.message || 'Resend API error');
        }
        
        logger.success('✅ Email sent successfully via Resend', {
          emailId: data.id,
          to: emailOptions.to,
          subject: emailOptions.subject,
          attempt: attempt
        });
        
        return {
          success: true,
          messageId: data.id,
          data: data
        };
      } catch (error) {
        lastError = error;
        logger.warn(`⚠️ Resend email attempt ${attempt}/${retries} failed`, {
          error: error.message,
          to: emailOptions.to
        });
        
        // If not the last attempt, wait before retrying
        if (attempt < retries) {
          const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s
          logger.info(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // All retries failed
    logger.error('❌ All Resend email attempts failed', lastError);
    throw lastError;
  }

  /**
   * Send contact form emails
   * @param {Object} data - Contact form data
   * @returns {Promise<Object>} - Result of email sending
   */
  async sendContactFormEmail(data) {
    try {
      logger.info('📋 Processing contact form email via Resend', { email: data.email });

      // Email to company
      const companyEmailOptions = {
        from: `Alcoa Scaffolding <${this.fromEmail}>`,
        to: [this.companyEmail],
        subject: `🔔 New Contact Form Submission from ${data.name}`,
        html: contactCompanyTemplate(data),
        reply_to: data.email,
        tags: [
          { name: 'category', value: 'contact-form' },
          { name: 'customer', value: data.email.replace(/[^a-zA-Z0-9_-]/g, '_') }
        ]
      };

      // Auto-reply to customer
      const customerEmailOptions = {
        from: `Alcoa Scaffolding <${this.fromEmail}>`,
        to: [data.email],
        subject: 'Thank You for Contacting Alcoa Aluminium Scaffolding',
        html: contactCustomerTemplate(data),
        reply_to: this.companyEmail,
        tags: [
          { name: 'category', value: 'contact-auto-reply' },
          { name: 'customer', value: data.email.replace(/[^a-zA-Z0-9_-]/g, '_') }
        ]
      };

      // Send both emails in parallel
      const [companyResult, customerResult] = await Promise.all([
        this.sendEmail(companyEmailOptions),
        this.sendEmail(customerEmailOptions)
      ]);

      logger.emailSent('Contact Form', `${this.companyEmail}, ${data.email}`, {
        name: data.name,
        projectType: data.projectType,
        companyEmailId: companyResult.messageId,
        customerEmailId: customerResult.messageId
      });

      return {
        success: true,
        message: 'Email sent successfully. We will contact you within 2 hours.',
        emailIds: {
          company: companyResult.messageId,
          customer: customerResult.messageId
        }
      };
    } catch (error) {
      logger.emailError('Contact Form', error, { email: data.email });
      throw new Error(`Failed to send contact form email: ${error.message}`);
    }
  }

  /**
   * Send quote request emails
   * @param {Object} data - Quote form data
   * @returns {Promise<Object>} - Result of email sending
   */
  async sendQuoteRequestEmail(data) {
    try {
      logger.info('💰 Processing quote request email via Resend', { email: data.email });

      // Email to company
      const companyEmailOptions = {
        from: `Alcoa Scaffolding <${this.fromEmail}>`,
        to: [this.companyEmail],
        subject: `💰 New Quote Request from ${data.name}`,
        html: quoteCompanyTemplate(data),
        reply_to: data.email,
        tags: [
          { name: 'category', value: 'quote-request' },
          { name: 'customer', value: data.email.replace(/[^a-zA-Z0-9_-]/g, '_') }
        ]
      };

      // Auto-reply to customer
      const customerEmailOptions = {
        from: `Alcoa Scaffolding <${this.fromEmail}>`,
        to: [data.email],
        subject: 'Your Quote Request - Alcoa Aluminium Scaffolding',
        html: quoteCustomerTemplate(data),
        reply_to: this.companyEmail,
        tags: [
          { name: 'category', value: 'quote-auto-reply' },
          { name: 'customer', value: data.email.replace(/[^a-zA-Z0-9_-]/g, '_') }
        ]
      };

      // Send both emails in parallel
      const [companyResult, customerResult] = await Promise.all([
        this.sendEmail(companyEmailOptions),
        this.sendEmail(customerEmailOptions)
      ]);

      logger.emailSent('Quote Request', `${this.companyEmail}, ${data.email}`, {
        name: data.name,
        projectHeight: data.projectHeight,
        coverageArea: data.coverageArea,
        companyEmailId: companyResult.messageId,
        customerEmailId: customerResult.messageId
      });

      return {
        success: true,
        message: 'Quote request sent successfully. We will send you a quote within 24 hours.',
        emailIds: {
          company: companyResult.messageId,
          customer: customerResult.messageId
        }
      };
    } catch (error) {
      logger.emailError('Quote Request', error, { email: data.email });
      throw new Error(`Failed to send quote request email: ${error.message}`);
    }
  }

  /**
   * Test Resend configuration
   */
  async testEmailConfig() {
    try {
      const resend = this.getResendClient();
      
      // Send a test email
      const { data, error } = await resend.emails.send({
        from: `Alcoa Scaffolding <${this.fromEmail}>`,
        to: [this.companyEmail],
        subject: '✅ Resend Email Service Test',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
              <h1 style="color: #10b981; margin: 0 0 20px 0;">✅ Success!</h1>
              <p style="font-size: 16px; color: #333; line-height: 1.6;">
                Your Resend email service is configured correctly and working perfectly!
              </p>
              <div style="background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0; color: #065f46;">
                  <strong>Configuration Details:</strong><br>
                  From Email: ${this.fromEmail}<br>
                  Company Email: ${this.companyEmail}<br>
                  Timestamp: ${new Date().toLocaleString()}
                </p>
              </div>
              <p style="font-size: 14px; color: #666;">
                This is a test email sent from your Alcoa Scaffolding backend server.
              </p>
            </div>
          </div>
        `
      });

      if (error) {
        throw new Error(error.message);
      }

      logger.success('✅ Resend email configuration test successful', { emailId: data.id });
      return { 
        success: true, 
        message: 'Resend email configuration is valid and working!',
        emailId: data.id
      };
    } catch (error) {
      logger.error('❌ Resend email configuration test failed', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  }

  /**
   * Send quotation email to customer with PDF attachment
   * @param {Object} quotation - Quotation object with customer details
   * @returns {Promise<Object>} - Result of email sending
   */
  async sendQuotationEmail(quotation) {
    try {
      const { quotationEmailTemplate } = require('../utils/quotationEmailTemplate');
      const { generateQuotationPDFBuffer } = require('../utils/playwrightPDFGenerator');
      
      logger.info('📋 Generating PDF for quotation email', { 
        quoteNumber: quotation.quoteNumber
      });

      // Generate PDF as buffer
      const pdfBuffer = await generateQuotationPDFBuffer(quotation);
      
      logger.info('📧 Sending quotation email via Resend with PDF attachment', { 
        quoteNumber: quotation.quoteNumber,
        customerEmail: quotation.customerEmail,
        pdfSize: `${(pdfBuffer.length / 1024).toFixed(2)} KB`
      });

      const emailOptions = {
        from: this.fromEmail,
        to: quotation.customerEmail,
        subject: `Quotation ${quotation.quoteNumber} - Alcoa Scaffolding`,
        html: quotationEmailTemplate(quotation),
        attachments: [
          {
            filename: `Quotation_${quotation.quoteNumber}.pdf`,
            content: pdfBuffer
          }
        ]
      };

      const result = await this.sendEmail(emailOptions);

      logger.success('✅ Quotation email sent successfully with PDF attachment', {
        quoteNumber: quotation.quoteNumber,
        emailId: result.messageId,
        sentTo: quotation.customerEmail,
        pdfSize: `${(pdfBuffer.length / 1024).toFixed(2)} KB`
      });

      return {
        success: true,
        message: 'Quotation email sent successfully with PDF attachment',
        emailId: result.messageId
      };
    } catch (error) {
      logger.error('❌ Failed to send quotation email', error);
      throw error;
    }
  }
}

module.exports = new ResendEmailService();

