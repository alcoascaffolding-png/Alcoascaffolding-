/**
 * Quotation Controller
 * Handles all quotation-related operations
 */

const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const logger = require('../utils/logger');
const { generateQuotationPDFBuffer } = require('../utils/playwrightPDFGenerator');

class QuotationController {
  /**
   * Get all quotations with pagination, filtering, and search
   */
  async getAllQuotations(req, res, next) {
    try {
      const {
        page = 1,
        limit = 25,
        status,
        quoteType,
        customer,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = {};

      if (status) query.status = status;
      if (quoteType) query.quoteType = quoteType;
      if (customer) query.customer = customer;

      if (search) {
        query.$or = [
          { quoteNumber: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Execute query
      const [quotations, total] = await Promise.all([
        Quotation.find(query)
          .populate('customer', 'companyName primaryEmail primaryPhone')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Quotation.countDocuments(query)
      ]);

      res.status(200).json({
        success: true,
        data: quotations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

      logger.info('Quotations fetched successfully', { count: quotations.length });
    } catch (error) {
      logger.error('Error fetching quotations', error);
      next(error);
    }
  }

  /**
   * Get quotation by ID
   */
  async getQuotationById(req, res, next) {
    try {
      const { id } = req.params;

      const quotation = await Quotation.findById(id)
        .populate('customer', 'companyName primaryEmail primaryPhone businessType');

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      res.status(200).json({
        success: true,
        data: quotation
      });

      logger.info('Quotation fetched', { id });
    } catch (error) {
      logger.error('Error fetching quotation', error);
      next(error);
    }
  }

  /**
   * Create new quotation
   */
  async createQuotation(req, res, next) {
    try {
      // Generate quote number
      const quoteNumber = await Quotation.generateQuoteNumber();

      // Get customer details
      const customer = await Customer.findById(req.body.customer);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const quotationData = {
        ...req.body,
        quoteNumber,
        customerName: customer.companyName,
        customerEmail: customer.primaryEmail,
        customerPhone: customer.primaryPhone,
        createdBy: req.user?.id,
        lastModifiedBy: req.user?.id
      };

      const quotation = new Quotation(quotationData);
      await quotation.save();

      res.status(201).json({
        success: true,
        message: 'Quotation created successfully',
        data: quotation
      });

      logger.info('Quotation created', { id: quotation._id, quoteNumber });
    } catch (error) {
      logger.error('Error creating quotation', error);
      next(error);
    }
  }

  /**
   * Update quotation
   */
  async updateQuotation(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        lastModifiedBy: req.user?.id
      };

      // Don't allow updating certain fields
      delete updateData.quoteNumber;
      delete updateData.createdBy;
      delete updateData.createdAt;

      const quotation = await Quotation.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('customer', 'companyName primaryEmail primaryPhone');

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Quotation updated successfully',
        data: quotation
      });

      logger.info('Quotation updated', { id, quoteNumber: quotation.quoteNumber });
    } catch (error) {
      logger.error('Error updating quotation', error);
      next(error);
    }
  }

  /**
   * Delete quotation
   */
  async deleteQuotation(req, res, next) {
    try {
      const { id } = req.params;

      const quotation = await Quotation.findByIdAndDelete(id);

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Quotation deleted successfully'
      });

      logger.info('Quotation deleted', { id, quoteNumber: quotation.quoteNumber });
    } catch (error) {
      logger.error('Error deleting quotation', error);
      next(error);
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await Quotation.getStatistics();

      const formattedStats = {
        total: stats.totals[0]?.total || 0,
        totalValue: stats.totals[0]?.totalValue || 0,
        approved: stats.totals[0]?.approvedCount || 0,
        approvedValue: stats.totals[0]?.approvedValue || 0,
        thisMonth: {
          count: stats.thisMonth[0]?.count || 0,
          value: stats.thisMonth[0]?.value || 0
        },
        byStatus: stats.statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byType: stats.typeCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };

      res.status(200).json({
        success: true,
        data: formattedStats
      });

      logger.info('Quotation statistics fetched');
    } catch (error) {
      logger.error('Error fetching statistics', error);
      next(error);
    }
  }

  /**
   * Check for new quotations (lightweight polling)
   */
  async checkForNew(req, res, next) {
    try {
      const { lastCheck } = req.query;
      const query = lastCheck ? { createdAt: { $gt: new Date(lastCheck) } } : {};

      const [newCount, latestQuotation, totalCount] = await Promise.all([
        Quotation.countDocuments(query),
        Quotation.findOne().sort({ createdAt: -1 }).select('createdAt').lean(),
        Quotation.countDocuments()
      ]);

      res.status(200).json({
        success: true,
        data: {
          hasNew: newCount > 0,
          newCount,
          latestTimestamp: latestQuotation?.createdAt,
          totalCount
        }
      });
    } catch (error) {
      logger.error('Error checking for new quotations', error);
      next(error);
    }
  }

  /**
   * Send quotation via email
   */
  async sendQuotationEmail(req, res, next) {
    try {
      const { id } = req.params;
      const { recipientEmail, ccEmails = [], message } = req.body;

      const quotation = await Quotation.findById(id)
        .populate('customer', 'companyName primaryEmail primaryPhone');

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      const emailToSend = recipientEmail || quotation.customerEmail;

      if (!emailToSend) {
        return res.status(400).json({
          success: false,
          message: 'Customer email not available. Please add email address to customer.'
        });
      }

      // Import email service
      const emailService = require('../services/resend.service');

      // Send actual email using Resend
      await emailService.sendQuotationEmail(quotation);

      // Update quotation status and history
      quotation.status = 'sent';
      quotation.sentDate = new Date();
      quotation.emailsSent.push({
        sentAt: new Date(),
        sentTo: emailToSend,
        subject: `Quotation ${quotation.quoteNumber} from Alcoa Scaffolding`,
        status: 'sent'
      });
      await quotation.save();

      logger.info('Quotation email sent successfully', { id, quoteNumber: quotation.quoteNumber, sentTo: emailToSend });

      res.status(200).json({
        success: true,
        message: 'Quotation sent successfully',
        data: quotation
      });
    } catch (error) {
      logger.error('Error sending quotation email', error);
      
      // Return specific error message
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send quotation email',
        details: error.toString()
      });
    }
  }

  /**
   * Send quotation via WhatsApp
   */
  async sendQuotationWhatsApp(req, res, next) {
    try {
      const { id } = req.params;
      const { recipientPhone, pdfUrl, message } = req.body;

      const quotation = await Quotation.findById(id)
        .populate('customer', 'companyName primaryEmail primaryPhone primaryWhatsApp');

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      const phoneToSend = recipientPhone || quotation.customerPhone || quotation.primaryPhone || quotation.primaryWhatsApp;

      if (!phoneToSend) {
        return res.status(400).json({
          success: false,
          message: 'Customer phone number not available. Please add phone number to customer.'
        });
      }

      // Import WhatsApp service
      const whatsappService = require('../services/whatsapp.service');

      // Generate PDF and get URL
      let finalPdfUrl = pdfUrl;
      
      if (!finalPdfUrl) {
        // Generate PDF buffer
        const { generateQuotationPDFBuffer } = require('../utils/playwrightPDFGenerator');
        const pdfBuffer = await generateQuotationPDFBuffer(quotation);
        
        // Upload PDF to temporary storage or use a file service
        // For now, we'll require PDF URL or implement file upload
        // You can integrate with S3, Cloudinary, or similar service here
        
        // Temporary solution: Save to public folder and serve via URL
        // In production, use cloud storage
        const fs = require('fs');
        const path = require('path');
        const publicDir = path.join(__dirname, '../public/quotation-pdfs');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        
        const filename = `Quotation_${quotation.quoteNumber}_${Date.now()}.pdf`;
        const filePath = path.join(publicDir, filename);
        fs.writeFileSync(filePath, pdfBuffer);
        
        // Generate public URL (adjust based on your server setup)
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        finalPdfUrl = `${baseUrl}/quotation-pdfs/${filename}`;
      }

      // Send WhatsApp message with PDF
      const result = await whatsappService.sendQuotationWhatsApp(quotation, finalPdfUrl);

      // Update quotation status and history
      quotation.status = 'sent';
      if (!quotation.sentDate) {
        quotation.sentDate = new Date();
      }
      
      // Track WhatsApp sending
      if (!quotation.whatsappSent) {
        quotation.whatsappSent = [];
      }
      quotation.whatsappSent.push({
        sentAt: new Date(),
        sentTo: phoneToSend,
        messageSid: result.messageSid,
        status: result.status
      });
      
      await quotation.save();

      logger.info('Quotation sent via WhatsApp successfully', { 
        id, 
        quoteNumber: quotation.quoteNumber, 
        sentTo: phoneToSend,
        messageSid: result.messageSid
      });

      res.status(200).json({
        success: true,
        message: 'Quotation sent via WhatsApp successfully',
        data: {
          quotation,
          whatsapp: {
            messageSid: result.messageSid,
            status: result.status,
            sentTo: phoneToSend
          }
        }
      });
    } catch (error) {
      logger.error('Error sending quotation via WhatsApp', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send quotation via WhatsApp',
        details: error.toString()
      });
    }
  }

  /**
   * Generate PDF for quotation
   */
  async generatePDF(req, res, next) {
    try {
      const { id } = req.params;

      const quotation = await Quotation.findById(id)
        .populate('customer', 'companyName primaryEmail primaryPhone businessType');

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      // Convert to plain object and ensure items array exists
      const quotationData = quotation.toObject ? quotation.toObject() : quotation;
      if (!quotationData.items || !Array.isArray(quotationData.items)) {
        quotationData.items = [];
      }

      // Generate PDF buffer
      const pdfBuffer = await generateQuotationPDFBuffer(quotationData);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Quotation_${quotation.quoteNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);

      logger.info('Quotation PDF generated', { id, quoteNumber: quotation.quoteNumber });
    } catch (error) {
      logger.error('Error generating quotation PDF', error);
      
      // Handle Playwright-specific errors
      let statusCode = 500;
      let errorMessage = error.message || 'Failed to generate PDF';
      
      if (error.message && error.message.includes('Playwright browser not installed')) {
        statusCode = 503; // Service Unavailable
        errorMessage = 'PDF generation service is temporarily unavailable. Please try again later.';
      } else if (error.message && error.message.includes('Executable doesn\'t exist')) {
        statusCode = 503;
        errorMessage = 'PDF generation service is temporarily unavailable. Please try again later.';
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      });
    }
  }
}

module.exports = new QuotationController();

