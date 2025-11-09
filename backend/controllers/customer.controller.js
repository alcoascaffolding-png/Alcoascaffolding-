/**
 * Customer Controller - Business Logic
 */

const Customer = require('../models/Customer');
const { generateCustomerCode } = require('../utils/codeGenerator');

/**
 * @desc    Get all customers with pagination and filtering
 * @route   GET /api/customers
 * @access  Private
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    // Search across multiple fields
    if (search) {
      query.$or = [
        { customerCode: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const customers = await Customer.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Customer.countDocuments(query);

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
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

/**
 * @desc    Get customer by ID
 * @route   GET /api/customers/:id
 * @access  Private
 */
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();

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
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

/**
 * @desc    Get customer statistics
 * @route   GET /api/customers/stats
 * @access  Private
 */
exports.getCustomerStats = async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveCustomers: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          totalCreditLimit: { $sum: '$creditLimit' },
          totalOutstanding: { $sum: '$balance' }
        }
      }
    ]);

    const result = stats[0] || {
      totalCustomers: 0,
      activeCustomers: 0,
      inactiveCustomers: 0,
      totalCreditLimit: 0,
      totalOutstanding: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get total outstanding amount
 * @route   GET /api/customers/outstanding
 * @access  Private
 */
exports.getOutstanding = async (req, res) => {
  try {
    const result = await Customer.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: null,
          totalOutstanding: { $sum: '$balance' }
        }
      }
    ]);

    const outstanding = result[0]?.totalOutstanding || 0;

    res.status(200).json({
      success: true,
      data: { outstanding }
    });
  } catch (error) {
    console.error('Get outstanding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching outstanding amount',
      error: error.message
    });
  }
};

/**
 * @desc    Create new customer
 * @route   POST /api/customers
 * @access  Private (Admin, Sales)
 */
exports.createCustomer = async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      mobile,
      city,
      address,
      taxRegistrationNumber,
      creditLimit,
      paymentTerms,
      status
    } = req.body;

    // Validate required fields
    if (!companyName || !contactPerson || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    // Generate customer code
    const customerCode = await generateCustomerCode();

    // Create customer
    const customer = await Customer.create({
      customerCode,
      companyName,
      contactPerson,
      email,
      phone,
      mobile,
      city,
      address,
      taxRegistrationNumber,
      creditLimit: creditLimit || 0,
      balance: 0, // Always starts at 0
      paymentTerms: paymentTerms || 30,
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private (Admin, Sales)
 */
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== customer.email) {
      const existingCustomer = await Customer.findOne({ email: req.body.email });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another customer'
        });
      }
    }

    // Update fields
    const allowedUpdates = [
      'companyName',
      'contactPerson',
      'email',
      'phone',
      'mobile',
      'city',
      'address',
      'taxRegistrationNumber',
      'creditLimit',
      'paymentTerms',
      'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        customer[field] = req.body[field];
      }
    });

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Private (Admin only)
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has outstanding balance
    if (customer.balance > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with outstanding balance. Please clear balance first.'
      });
    }

    // Soft delete (mark as inactive) instead of hard delete
    customer.status = 'inactive';
    customer.deletedAt = new Date();
    await customer.save();

    // OR hard delete if you prefer
    // await Customer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

