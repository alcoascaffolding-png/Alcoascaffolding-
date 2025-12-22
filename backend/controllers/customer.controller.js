/**
 * Customer Controller
 * Handles all customer-related operations
 */

const Customer = require('../models/Customer');
const logger = require('../utils/logger');

class CustomerController {
  /**
   * Get all customers with pagination, filtering, and search
   */
  async getAllCustomers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 25,
        status,
        customerType,
        businessType,
        priority,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = {};

      // Filters
      if (status) query.status = status;
      if (customerType) query.customerType = customerType;
      if (businessType) query.businessType = businessType;
      if (priority) query.priority = priority;

      // Search
      if (search) {
        query.$or = [
          { companyName: { $regex: search, $options: 'i' } },
          { displayName: { $regex: search, $options: 'i' } },
          { primaryEmail: { $regex: search, $options: 'i' } },
          { primaryPhone: { $regex: search, $options: 'i' } },
          { tradeLicenseNumber: { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Execute query
      const [customers, total] = await Promise.all([
        Customer.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Customer.countDocuments(query)
      ]);

      res.status(200).json({
        success: true,
        data: customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

      logger.info('Customers fetched successfully', { count: customers.length });
    } catch (error) {
      logger.error('Error fetching customers', error);
      next(error);
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(req, res, next) {
    try {
      const { id } = req.params;

      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.status(200).json({
        success: true,
        data: customer
      });

      logger.info('Customer fetched', { id });
    } catch (error) {
      logger.error('Error fetching customer', error);
      next(error);
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(req, res, next) {
    try {
      const customerData = {
        ...req.body,
        createdBy: req.user?.id,
        lastModifiedBy: req.user?.id
      };

      const customer = new Customer(customerData);
      await customer.save();

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer
      });

      logger.info('Customer created', { id: customer._id, company: customer.companyName });
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      logger.error('Error creating customer', error);
      next(error);
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        lastModifiedBy: req.user?.id
      };

      // Don't allow updating certain system fields
      delete updateData.createdBy;
      delete updateData.createdAt;
      delete updateData.totalOrders;
      delete updateData.totalRevenue;

      const customer = await Customer.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: customer
      });

      logger.info('Customer updated', { id, company: customer.companyName });
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      logger.error('Error updating customer', error);
      next(error);
    }
  }

  /**
   * Delete customer (soft delete by setting status to inactive)
   */
  async deleteCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const { hard = false } = req.query;

      if (hard === 'true') {
        // Hard delete (permanent)
        const customer = await Customer.findByIdAndDelete(id);

        if (!customer) {
          return res.status(404).json({
            success: false,
            message: 'Customer not found'
          });
        }

        logger.warn('Customer permanently deleted', { id, company: customer.companyName });
      } else {
        // Soft delete (set to inactive)
        const customer = await Customer.findByIdAndUpdate(
          id,
          { status: 'inactive', lastModifiedBy: req.user?.id },
          { new: true }
        );

        if (!customer) {
          return res.status(404).json({
            success: false,
            message: 'Customer not found'
          });
        }

        logger.info('Customer deactivated', { id, company: customer.companyName });
      }

      res.status(200).json({
        success: true,
        message: hard === 'true' ? 'Customer deleted permanently' : 'Customer deactivated'
      });
    } catch (error) {
      logger.error('Error deleting customer', error);
      next(error);
    }
  }

  /**
   * Get customer statistics
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await Customer.getStatistics();

      // Format the response
      const formattedStats = {
        total: stats.totals[0]?.total || 0,
        active: stats.totals[0]?.activeCustomers || 0,
        totalRevenue: stats.totals[0]?.totalRevenue || 0,
        totalOrders: stats.totals[0]?.totalOrders || 0,
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

      logger.info('Customer statistics fetched');
    } catch (error) {
      logger.error('Error fetching statistics', error);
      next(error);
    }
  }

  /**
   * Add contact person to customer
   */
  async addContactPerson(req, res, next) {
    try {
      const { id } = req.params;
      const contactData = req.body;

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      customer.contactPersons.push(contactData);
      await customer.save();

      res.status(200).json({
        success: true,
        message: 'Contact person added successfully',
        data: customer
      });

      logger.info('Contact person added', { customerId: id });
    } catch (error) {
      logger.error('Error adding contact person', error);
      next(error);
    }
  }

  /**
   * Update contact person
   */
  async updateContactPerson(req, res, next) {
    try {
      const { id, contactId } = req.params;
      const updateData = req.body;

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const contact = customer.contactPersons.id(contactId);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact person not found'
        });
      }

      Object.assign(contact, updateData);
      await customer.save();

      res.status(200).json({
        success: true,
        message: 'Contact person updated successfully',
        data: customer
      });

      logger.info('Contact person updated', { customerId: id, contactId });
    } catch (error) {
      logger.error('Error updating contact person', error);
      next(error);
    }
  }

  /**
   * Delete contact person
   */
  async deleteContactPerson(req, res, next) {
    try {
      const { id, contactId } = req.params;

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      customer.contactPersons.pull(contactId);
      await customer.save();

      res.status(200).json({
        success: true,
        message: 'Contact person deleted successfully',
        data: customer
      });

      logger.info('Contact person deleted', { customerId: id, contactId });
    } catch (error) {
      logger.error('Error deleting contact person', error);
      next(error);
    }
  }

  /**
   * Add address to customer
   */
  async addAddress(req, res, next) {
    try {
      const { id } = req.params;
      const addressData = req.body;

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      customer.addresses.push(addressData);
      await customer.save();

      res.status(200).json({
        success: true,
        message: 'Address added successfully',
        data: customer
      });

      logger.info('Address added', { customerId: id });
    } catch (error) {
      logger.error('Error adding address', error);
      next(error);
    }
  }

  /**
   * Update address
   */
  async updateAddress(req, res, next) {
    try {
      const { id, addressId } = req.params;
      const updateData = req.body;

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const address = customer.addresses.id(addressId);
      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      Object.assign(address, updateData);
      await customer.save();

      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: customer
      });

      logger.info('Address updated', { customerId: id, addressId });
    } catch (error) {
      logger.error('Error updating address', error);
      next(error);
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(req, res, next) {
    try {
      const { id, addressId } = req.params;

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      customer.addresses.pull(addressId);
      await customer.save();

      res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
        data: customer
      });

      logger.info('Address deleted', { customerId: id, addressId });
    } catch (error) {
      logger.error('Error deleting address', error);
      next(error);
    }
  }

  /**
   * Check for new customers (lightweight endpoint for polling)
   */
  async checkForNew(req, res, next) {
    try {
      const { lastCheck } = req.query;
      const query = lastCheck ? { createdAt: { $gt: new Date(lastCheck) } } : {};

      const [newCount, latestCustomer, totalCount] = await Promise.all([
        Customer.countDocuments(query),
        Customer.findOne().sort({ createdAt: -1 }).select('createdAt').lean(),
        Customer.countDocuments()
      ]);

      res.status(200).json({
        success: true,
        data: {
          hasNew: newCount > 0,
          newCount,
          latestTimestamp: latestCustomer?.createdAt,
          totalCount
        }
      });
    } catch (error) {
      logger.error('Error checking for new customers', error);
      next(error);
    }
  }
}

module.exports = new CustomerController();
