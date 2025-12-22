/**
 * Contact Message Controller
 * Handles CRUD operations for contact messages in admin panel
 */

const ContactMessage = require('../models/ContactMessage');
const logger = require('../utils/logger');

class ContactMessageController {
  /**
   * LIGHTWEIGHT CHECK - Only returns if new messages exist
   * GET /api/contact-messages/check-new
   * Reduces API payload by 95% - perfect for polling
   */
  async checkForNew(req, res, next) {
    try {
      const { lastCheck } = req.query;
      
      // Only count new messages since lastCheck timestamp
      const query = lastCheck ? { createdAt: { $gt: new Date(lastCheck) } } : {};
      
      const [newCount, latestMessage, totalCount] = await Promise.all([
        ContactMessage.countDocuments(query),
        ContactMessage.findOne().sort({ createdAt: -1 }).select('createdAt').lean(),
        ContactMessage.countDocuments()
      ]);

      res.status(200).json({
        success: true,
        data: {
          hasNew: newCount > 0,
          newCount,
          latestTimestamp: latestMessage?.createdAt,
          totalCount
        }
      });
    } catch (error) {
      logger.error('Error checking for new messages', error);
      next(error);
    }
  }

  /**
   * GET /api/contact-messages
   * Get all messages - OPTIMIZED with .lean() for better performance
   */
  async getAllMessages(req, res, next) {
    
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        type, 
        priority,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = {};
      
      if (status) query.status = status;
      if (type) query.type = type;
      if (priority) query.priority = priority;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Execute query
      const [messages, total] = await Promise.all([
        ContactMessage.find(query)
          .populate('assignedTo', 'name email')
          .populate('respondedBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        ContactMessage.countDocuments(query)
      ]);

      // Get status counts for filters
      const statusCounts = await ContactMessage.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const typeCounts = await ContactMessage.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      res.status(200).json({
        success: true,
        data: messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        filters: {
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          typeCounts: typeCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        }
      });
    } catch (error) {
      logger.error('Error fetching contact messages', error);
      next(error);
    }
  }

  /**
   * Get single contact message by ID
   * GET /api/contact-messages/:id
   */
  async getMessageById(req, res, next) {
    try {
      const message = await ContactMessage.findById(req.params.id)
        .populate('assignedTo', 'name email')
        .populate('respondedBy', 'name email');

      if (!message) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }

      res.status(200).json({
        success: true,
        data: message
      });
    } catch (error) {
      logger.error('Error fetching contact message', error);
      next(error);
    }
  }

  /**
   * Update contact message status
   * PATCH /api/contact-messages/:id
   */
  async updateMessage(req, res, next) {
    try {
      const { status, priority, adminNotes, assignedTo } = req.body;
      
      const updateData = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      
      // If marking as responded
      if (status === 'responded' && req.body.markAsResponded) {
        updateData.respondedAt = new Date();
        updateData.respondedBy = req.user?._id; // Assuming auth middleware adds user
      }

      const message = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email')
       .populate('respondedBy', 'name email');

      if (!message) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }

      logger.info('Contact message updated', { id: message._id, updates: updateData });

      res.status(200).json({
        success: true,
        data: message
      });
    } catch (error) {
      logger.error('Error updating contact message', error);
      next(error);
    }
  }

  /**
   * Delete contact message
   * DELETE /api/contact-messages/:id
   */
  async deleteMessage(req, res, next) {
    try {
      const message = await ContactMessage.findByIdAndDelete(req.params.id);

      if (!message) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }

      logger.info('Contact message deleted', { id: req.params.id });

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting contact message', error);
      next(error);
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/contact-messages/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await ContactMessage.aggregate([
        {
          $facet: {
            totalCount: [{ $count: 'count' }],
            statusBreakdown: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            typeBreakdown: [
              { $group: { _id: '$type', count: { $sum: 1 } } }
            ],
            priorityBreakdown: [
              { $group: { _id: '$priority', count: { $sum: 1 } } }
            ],
            recentMessages: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              { $project: { name: 1, email: 1, type: 1, status: 1, createdAt: 1 } }
            ]
          }
        }
      ]);

      const result = stats[0];

      res.status(200).json({
        success: true,
        data: {
          total: result.totalCount[0]?.count || 0,
          byStatus: result.statusBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          byType: result.typeBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          byPriority: result.priorityBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          recent: result.recentMessages
        }
      });
    } catch (error) {
      logger.error('Error fetching contact message stats', error);
      next(error);
    }
  }

  /**
   * Bulk update messages
   * POST /api/contact-messages/bulk-update
   */
  async bulkUpdate(req, res, next) {
    try {
      const { ids, updates } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid IDs provided'
        });
      }

      const result = await ContactMessage.updateMany(
        { _id: { $in: ids } },
        updates
      );

      logger.info('Bulk update performed', { count: result.modifiedCount, ids });

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} messages updated`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      logger.error('Error in bulk update', error);
      next(error);
    }
  }
}

module.exports = new ContactMessageController();

