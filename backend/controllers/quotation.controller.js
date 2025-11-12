/**
 * Quotation Controller
 * Handles all quotation-related operations
 */

const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const logger = require('../utils/logger');

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
}

module.exports = new QuotationController();

