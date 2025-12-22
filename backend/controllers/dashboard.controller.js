/**
 * Dashboard Controller - Aggregated Business Metrics
 */

const Customer = require('../models/Customer');
const Quote = require('../models/Quote');
const SalesOrder = require('../models/SalesOrder');
const SalesInvoice = require('../models/SalesInvoice');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get all stats in parallel for better performance
    const [
      customerStats,
      quoteStats,
      orderStats,
      invoiceStats,
      revenueStats
    ] = await Promise.all([
      // Customer stats
      Customer.aggregate([
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            activeCustomers: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalOutstanding: { $sum: '$balance' }
          }
        }
      ]),

      // Quote stats
      Quote.aggregate([
        {
          $group: {
            _id: null,
            totalQuotes: { $sum: 1 },
            acceptedQuotes: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
            },
            pendingQuotes: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['draft', 'sent']] },
                  1,
                  0
                ]
              }
            },
            totalQuoteValue: { $sum: '$total' }
          }
        }
      ]),

      // Sales Order stats
      SalesOrder.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['confirmed', 'in_progress']] },
                  1,
                  0
                ]
              }
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            }
          }
        }
      ]),

      // Invoice stats
      SalesInvoice.aggregate([
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            paidInvoices: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
            },
            overdueInvoices: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'overdue'] }, 1, 0] }
            },
            totalInvoiced: { $sum: '$total' },
            totalPaid: { $sum: '$paidAmount' }
          }
        }
      ]),

      // Revenue stats (last 30 days)
      SalesInvoice.aggregate([
        {
          $match: {
            invoiceDate: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: null,
            monthlyRevenue: { $sum: '$total' }
          }
        }
      ])
    ]);

    // Extract data with defaults
    const customers = customerStats[0] || {
      totalCustomers: 0,
      activeCustomers: 0,
      totalOutstanding: 0
    };

    const quotes = quoteStats[0] || {
      totalQuotes: 0,
      acceptedQuotes: 0,
      pendingQuotes: 0,
      totalQuoteValue: 0
    };

    const orders = orderStats[0] || {
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0
    };

    const invoices = invoiceStats[0] || {
      totalInvoices: 0,
      paidInvoices: 0,
      overdueInvoices: 0,
      totalInvoiced: 0,
      totalPaid: 0
    };

    const revenue = revenueStats[0] || {
      monthlyRevenue: 0
    };

    // Compile dashboard stats
    const dashboardData = {
      customers: {
        total: customers.totalCustomers,
        active: customers.activeCustomers,
        outstanding: customers.totalOutstanding
      },
      quotes: {
        total: quotes.totalQuotes,
        accepted: quotes.acceptedQuotes,
        pending: quotes.pendingQuotes,
        value: quotes.totalQuoteValue
      },
      orders: {
        total: orders.totalOrders,
        pending: orders.pendingOrders,
        delivered: orders.deliveredOrders
      },
      invoices: {
        total: invoices.totalInvoices,
        paid: invoices.paidInvoices,
        overdue: invoices.overdueInvoices,
        totalValue: invoices.totalInvoiced,
        collected: invoices.totalPaid,
        outstanding: invoices.totalInvoiced - invoices.totalPaid
      },
      revenue: {
        monthly: revenue.monthlyRevenue,
        annual: revenue.monthlyRevenue * 12 // Projection
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get sales overview for charts
 * @route   GET /api/dashboard/sales-overview
 * @access  Private
 */
exports.getSalesOverview = async (req, res) => {
  try {
    const { period = '6months' } = req.query;

    let startDate;
    if (period === '6months') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === '1year') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
    }

    const salesData = await SalesInvoice.aggregate([
      {
        $match: {
          invoiceDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' }
          },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Get sales overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales overview',
      error: error.message
    });
  }
};

/**
 * @desc    Get recent activities
 * @route   GET /api/dashboard/recent-activities
 * @access  Private
 */
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent orders
    const recentOrders = await SalesOrder.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderNumber customerName total status createdAt')
      .lean();

    // Get recent invoices
    const recentInvoices = await SalesInvoice.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('invoiceNumber customerName total paymentStatus createdAt')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        orders: recentOrders,
        invoices: recentInvoices
      }
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};

/**
 * @desc    Get top customers by revenue
 * @route   GET /api/dashboard/top-customers
 * @access  Private
 */
exports.getTopCustomers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topCustomers = await SalesInvoice.aggregate([
      {
        $group: {
          _id: '$customerName',
          totalRevenue: { $sum: '$total' },
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: limit
      }
    ]);

    res.status(200).json({
      success: true,
      data: topCustomers
    });
  } catch (error) {
    console.error('Get top customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top customers',
      error: error.message
    });
  }
};

/**
 * @desc    Get pending invoices
 * @route   GET /api/dashboard/pending-invoices
 * @access  Private
 */
exports.getPendingInvoices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const pendingInvoices = await SalesInvoice.find({
      paymentStatus: { $in: ['unpaid', 'partially_paid', 'overdue'] }
    })
      .sort({ dueDate: 1 })
      .limit(limit)
      .select('invoiceNumber customerName total paidAmount balance paymentStatus dueDate')
      .lean();

    res.status(200).json({
      success: true,
      data: pendingInvoices
    });
  } catch (error) {
    console.error('Get pending invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending invoices',
      error: error.message
    });
  }
};

