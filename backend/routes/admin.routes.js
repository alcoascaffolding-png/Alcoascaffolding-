/**
 * Admin Routes
 * Centralized routes for all admin modules
 */

const express = require('express');
const router = express.Router();
const { authenticate, restrictTo, checkPermission } = require('../middleware/auth');
const authConfig = require('../config/auth.config');
const crudFactory = require('../utils/crudFactory');

// Import all models
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Quote = require('../models/Quote');
const SalesOrder = require('../models/SalesOrder');
const SalesInvoice = require('../models/SalesInvoice');
const SalesReturn = require('../models/SalesReturn');
const DeliveryNote = require('../models/DeliveryNote');
const ProformaInvoice = require('../models/ProformaInvoice');
const WorkCompletion = require('../models/WorkCompletion');
const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseInvoice = require('../models/PurchaseInvoice');
const PurchaseReturn = require('../models/PurchaseReturn');
const StockAdjustment = require('../models/StockAdjustment');
const StockMovement = require('../models/StockMovement');
const BankAccount = require('../models/BankAccount');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const JournalEntry = require('../models/JournalEntry');
const ContraVoucher = require('../models/ContraVoucher');
const User = require('../models/User');

// Apply authentication to all routes
router.use(authenticate);

// ======================
// USER MANAGEMENT
// ======================
router.get('/users', 
  restrictTo(authConfig.roles.SUPER_ADMIN, authConfig.roles.ADMIN),
  crudFactory.getAll(User)
);
router.get('/users/:id',
  restrictTo(authConfig.roles.SUPER_ADMIN, authConfig.roles.ADMIN),
  crudFactory.getOne(User)
);
router.put('/users/:id',
  restrictTo(authConfig.roles.SUPER_ADMIN, authConfig.roles.ADMIN),
  crudFactory.updateOne(User)
);
router.delete('/users/:id',
  restrictTo(authConfig.roles.SUPER_ADMIN),
  crudFactory.deleteOne(User)
);

// ======================
// CUSTOMER MANAGEMENT
// ======================
router.route('/customers')
  .get(crudFactory.getAll(Customer))
  .post(checkPermission(authConfig.permissions.CUSTOMER_CREATE), crudFactory.createOne(Customer));

router.route('/customers/:id')
  .get(crudFactory.getOne(Customer))
  .put(checkPermission(authConfig.permissions.CUSTOMER_UPDATE), crudFactory.updateOne(Customer))
  .delete(checkPermission(authConfig.permissions.CUSTOMER_DELETE), crudFactory.deleteOne(Customer));

// ======================
// VENDOR MANAGEMENT
// ======================
router.route('/vendors')
  .get(crudFactory.getAll(Vendor))
  .post(checkPermission(authConfig.permissions.VENDOR_CREATE), crudFactory.createOne(Vendor));

router.route('/vendors/:id')
  .get(crudFactory.getOne(Vendor))
  .put(checkPermission(authConfig.permissions.VENDOR_UPDATE), crudFactory.updateOne(Vendor))
  .delete(checkPermission(authConfig.permissions.VENDOR_DELETE), crudFactory.deleteOne(Vendor));

// ======================
// PRODUCT/INVENTORY MANAGEMENT
// ======================
router.route('/products')
  .get(crudFactory.getAll(Product, ['preferredVendor', 'vendors.vendor']))
  .post(checkPermission(authConfig.permissions.INVENTORY_CREATE), crudFactory.createOne(Product));

router.route('/products/:id')
  .get(crudFactory.getOne(Product, ['preferredVendor', 'vendors.vendor']))
  .put(checkPermission(authConfig.permissions.INVENTORY_UPDATE), crudFactory.updateOne(Product))
  .delete(checkPermission(authConfig.permissions.INVENTORY_DELETE), crudFactory.deleteOne(Product));

// ======================
// QUOTES
// ======================
router.route('/quotes')
  .get(crudFactory.getAll(Quote, ['customer', 'createdBy']))
  .post(checkPermission(authConfig.permissions.CUSTOMER_CREATE), crudFactory.createOne(Quote));

router.route('/quotes/:id')
  .get(crudFactory.getOne(Quote, ['customer', 'salesOrderRef', 'createdBy']))
  .put(checkPermission(authConfig.permissions.CUSTOMER_UPDATE), crudFactory.updateOne(Quote))
  .delete(checkPermission(authConfig.permissions.CUSTOMER_DELETE), crudFactory.deleteOne(Quote));

// ======================
// SALES ORDERS
// ======================
router.route('/sales-orders')
  .get(crudFactory.getAll(SalesOrder, ['customer', 'quoteRef', 'createdBy']))
  .post(checkPermission(authConfig.permissions.CUSTOMER_CREATE), crudFactory.createOne(SalesOrder));

router.route('/sales-orders/:id')
  .get(crudFactory.getOne(SalesOrder, ['customer', 'quoteRef', 'createdBy']))
  .put(checkPermission(authConfig.permissions.CUSTOMER_UPDATE), crudFactory.updateOne(SalesOrder))
  .delete(checkPermission(authConfig.permissions.CUSTOMER_DELETE), crudFactory.deleteOne(SalesOrder));

// ======================
// SALES INVOICES
// ======================
router.route('/sales-invoices')
  .get(crudFactory.getAll(SalesInvoice, ['customer', 'salesOrderRef', 'deliveryNoteRef', 'createdBy']))
  .post(checkPermission(authConfig.permissions.CUSTOMER_CREATE), crudFactory.createOne(SalesInvoice));

router.route('/sales-invoices/:id')
  .get(crudFactory.getOne(SalesInvoice, ['customer', 'salesOrderRef', 'deliveryNoteRef', 'createdBy']))
  .put(checkPermission(authConfig.permissions.CUSTOMER_UPDATE), crudFactory.updateOne(SalesInvoice))
  .delete(checkPermission(authConfig.permissions.CUSTOMER_DELETE), crudFactory.deleteOne(SalesInvoice));

// ======================
// SALES RETURNS
// ======================
router.route('/sales-returns')
  .get(crudFactory.getAll(SalesReturn, ['customer', 'salesInvoiceRef', 'approvedBy', 'createdBy']))
  .post(checkPermission(authConfig.permissions.CUSTOMER_CREATE), crudFactory.createOne(SalesReturn));

router.route('/sales-returns/:id')
  .get(crudFactory.getOne(SalesReturn, ['customer', 'salesInvoiceRef', 'approvedBy', 'createdBy']))
  .put(checkPermission(authConfig.permissions.CUSTOMER_UPDATE), crudFactory.updateOne(SalesReturn))
  .delete(checkPermission(authConfig.permissions.CUSTOMER_DELETE), crudFactory.deleteOne(SalesReturn));

// ======================
// DELIVERY NOTES
// ======================
router.route('/delivery-notes')
  .get(crudFactory.getAll(DeliveryNote, ['customer', 'salesOrderRef', 'invoiceRef', 'createdBy']))
  .post(checkPermission(authConfig.permissions.CUSTOMER_CREATE), crudFactory.createOne(DeliveryNote));

router.route('/delivery-notes/:id')
  .get(crudFactory.getOne(DeliveryNote, ['customer', 'salesOrderRef', 'invoiceRef', 'createdBy']))
  .put(checkPermission(authConfig.permissions.CUSTOMER_UPDATE), crudFactory.updateOne(DeliveryNote))
  .delete(checkPermission(authConfig.permissions.CUSTOMER_DELETE), crudFactory.deleteOne(DeliveryNote));

// ======================
// PROFORMA INVOICES
// ======================
router.route('/proforma-invoices')
  .get(crudFactory.getAll(ProformaInvoice, ['customer', 'quoteRef', 'salesOrderRef', 'invoiceRef', 'createdBy']))
  .post(checkPermission(authConfig.permissions.CUSTOMER_CREATE), crudFactory.createOne(ProformaInvoice));

router.route('/proforma-invoices/:id')
  .get(crudFactory.getOne(ProformaInvoice, ['customer', 'quoteRef', 'salesOrderRef', 'invoiceRef', 'createdBy']))
  .put(checkPermission(authConfig.permissions.CUSTOMER_UPDATE), crudFactory.updateOne(ProformaInvoice))
  .delete(checkPermission(authConfig.permissions.CUSTOMER_DELETE), crudFactory.deleteOne(ProformaInvoice));

// ======================
// WORK COMPLETION
// ======================
router.route('/work-completions')
  .get(crudFactory.getAll(WorkCompletion, ['customer', 'salesOrderRef', 'invoiceRef', 'createdBy']))
  .post(checkPermission(authConfig.permissions.CUSTOMER_CREATE), crudFactory.createOne(WorkCompletion));

router.route('/work-completions/:id')
  .get(crudFactory.getOne(WorkCompletion, ['customer', 'salesOrderRef', 'invoiceRef', 'createdBy']))
  .put(checkPermission(authConfig.permissions.CUSTOMER_UPDATE), crudFactory.updateOne(WorkCompletion))
  .delete(checkPermission(authConfig.permissions.CUSTOMER_DELETE), crudFactory.deleteOne(WorkCompletion));

// ======================
// PURCHASE ORDERS
// ======================
router.route('/purchase-orders')
  .get(crudFactory.getAll(PurchaseOrder, ['vendor', 'approvedBy', 'createdBy']))
  .post(checkPermission(authConfig.permissions.VENDOR_CREATE), crudFactory.createOne(PurchaseOrder));

router.route('/purchase-orders/:id')
  .get(crudFactory.getOne(PurchaseOrder, ['vendor', 'approvedBy', 'createdBy']))
  .put(checkPermission(authConfig.permissions.VENDOR_UPDATE), crudFactory.updateOne(PurchaseOrder))
  .delete(checkPermission(authConfig.permissions.VENDOR_DELETE), crudFactory.deleteOne(PurchaseOrder));

// ======================
// PURCHASE INVOICES
// ======================
router.route('/purchase-invoices')
  .get(crudFactory.getAll(PurchaseInvoice, ['vendor', 'purchaseOrderRef', 'approvedBy', 'createdBy']))
  .post(checkPermission(authConfig.permissions.VENDOR_CREATE), crudFactory.createOne(PurchaseInvoice));

router.route('/purchase-invoices/:id')
  .get(crudFactory.getOne(PurchaseInvoice, ['vendor', 'purchaseOrderRef', 'approvedBy', 'createdBy']))
  .put(checkPermission(authConfig.permissions.VENDOR_UPDATE), crudFactory.updateOne(PurchaseInvoice))
  .delete(checkPermission(authConfig.permissions.VENDOR_DELETE), crudFactory.deleteOne(PurchaseInvoice));

// ======================
// PURCHASE RETURNS
// ======================
router.route('/purchase-returns')
  .get(crudFactory.getAll(PurchaseReturn, ['vendor', 'purchaseInvoiceRef', 'purchaseOrderRef', 'approvedBy', 'createdBy']))
  .post(checkPermission(authConfig.permissions.VENDOR_CREATE), crudFactory.createOne(PurchaseReturn));

router.route('/purchase-returns/:id')
  .get(crudFactory.getOne(PurchaseReturn, ['vendor', 'purchaseInvoiceRef', 'purchaseOrderRef', 'approvedBy', 'createdBy']))
  .put(checkPermission(authConfig.permissions.VENDOR_UPDATE), crudFactory.updateOne(PurchaseReturn))
  .delete(checkPermission(authConfig.permissions.VENDOR_DELETE), crudFactory.deleteOne(PurchaseReturn));

// ======================
// STOCK ADJUSTMENTS
// ======================
router.route('/stock-adjustments')
  .get(crudFactory.getAll(StockAdjustment, ['items.product', 'approvedBy', 'createdBy']))
  .post(checkPermission(authConfig.permissions.INVENTORY_CREATE), crudFactory.createOne(StockAdjustment));

router.route('/stock-adjustments/:id')
  .get(crudFactory.getOne(StockAdjustment, ['items.product', 'approvedBy', 'createdBy']))
  .put(checkPermission(authConfig.permissions.INVENTORY_UPDATE), crudFactory.updateOne(StockAdjustment))
  .delete(checkPermission(authConfig.permissions.INVENTORY_DELETE), crudFactory.deleteOne(StockAdjustment));

// ======================
// STOCK MOVEMENTS
// ======================
router.route('/stock-movements')
  .get(crudFactory.getAll(StockMovement, ['product', 'createdBy']));

router.route('/stock-movements/:id')
  .get(crudFactory.getOne(StockMovement, ['product', 'createdBy']));

// ======================
// BANK ACCOUNTS
// ======================
router.route('/bank-accounts')
  .get(crudFactory.getAll(BankAccount))
  .post(checkPermission(authConfig.permissions.ACCOUNTS_CREATE), crudFactory.createOne(BankAccount));

router.route('/bank-accounts/:id')
  .get(crudFactory.getOne(BankAccount))
  .put(checkPermission(authConfig.permissions.ACCOUNTS_UPDATE), crudFactory.updateOne(BankAccount))
  .delete(checkPermission(authConfig.permissions.ACCOUNTS_DELETE), crudFactory.deleteOne(BankAccount));

// ======================
// RECEIPTS
// ======================
router.route('/receipts')
  .get(crudFactory.getAll(Receipt, ['customer', 'bankAccount', 'invoices.invoice', 'createdBy']))
  .post(checkPermission(authConfig.permissions.ACCOUNTS_CREATE), crudFactory.createOne(Receipt));

router.route('/receipts/:id')
  .get(crudFactory.getOne(Receipt, ['customer', 'bankAccount', 'invoices.invoice', 'createdBy']))
  .put(checkPermission(authConfig.permissions.ACCOUNTS_UPDATE), crudFactory.updateOne(Receipt))
  .delete(checkPermission(authConfig.permissions.ACCOUNTS_DELETE), crudFactory.deleteOne(Receipt));

// ======================
// PAYMENTS
// ======================
router.route('/payments')
  .get(crudFactory.getAll(Payment, ['vendor', 'bankAccount', 'invoices.invoice', 'approvedBy', 'createdBy']))
  .post(checkPermission(authConfig.permissions.ACCOUNTS_CREATE), crudFactory.createOne(Payment));

router.route('/payments/:id')
  .get(crudFactory.getOne(Payment, ['vendor', 'bankAccount', 'invoices.invoice', 'approvedBy', 'createdBy']))
  .put(checkPermission(authConfig.permissions.ACCOUNTS_UPDATE), crudFactory.updateOne(Payment))
  .delete(checkPermission(authConfig.permissions.ACCOUNTS_DELETE), crudFactory.deleteOne(Payment));

// ======================
// JOURNAL ENTRIES
// ======================
router.route('/journal-entries')
  .get(crudFactory.getAll(JournalEntry, ['createdBy', 'reversedBy', 'reversalOf']))
  .post(checkPermission(authConfig.permissions.ACCOUNTS_CREATE), crudFactory.createOne(JournalEntry));

router.route('/journal-entries/:id')
  .get(crudFactory.getOne(JournalEntry, ['createdBy', 'reversedBy', 'reversalOf']))
  .put(checkPermission(authConfig.permissions.ACCOUNTS_UPDATE), crudFactory.updateOne(JournalEntry))
  .delete(checkPermission(authConfig.permissions.ACCOUNTS_DELETE), crudFactory.deleteOne(JournalEntry));

// ======================
// CONTRA VOUCHERS
// ======================
router.route('/contra-vouchers')
  .get(crudFactory.getAll(ContraVoucher, ['fromAccount', 'toAccount', 'createdBy']))
  .post(checkPermission(authConfig.permissions.ACCOUNTS_CREATE), crudFactory.createOne(ContraVoucher));

router.route('/contra-vouchers/:id')
  .get(crudFactory.getOne(ContraVoucher, ['fromAccount', 'toAccount', 'createdBy']))
  .put(checkPermission(authConfig.permissions.ACCOUNTS_UPDATE), crudFactory.updateOne(ContraVoucher))
  .delete(checkPermission(authConfig.permissions.ACCOUNTS_DELETE), crudFactory.deleteOne(ContraVoucher));

// ======================
// DASHBOARD ANALYTICS
// ======================
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalCustomers,
      totalVendors,
      totalProducts,
      totalSalesOrders,
      totalPurchaseOrders,
      pendingInvoices,
      overdueInvoices
    ] = await Promise.all([
      Customer.countDocuments({ status: 'active' }),
      Vendor.countDocuments({ status: 'active' }),
      Product.countDocuments({ isActive: true }),
      SalesOrder.countDocuments(),
      PurchaseOrder.countDocuments(),
      SalesInvoice.countDocuments({ paymentStatus: { $in: ['unpaid', 'partially_paid'] } }),
      SalesInvoice.countDocuments({ paymentStatus: 'overdue' })
    ]);

    // Sales revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await SalesInvoice.aggregate([
      { $match: { invoiceDate: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const monthlyExpenses = await PurchaseInvoice.aggregate([
      { $match: { invoiceDate: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        customers: totalCustomers,
        vendors: totalVendors,
        products: totalProducts,
        salesOrders: totalSalesOrders,
        purchaseOrders: totalPurchaseOrders,
        pendingInvoices,
        overdueInvoices,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        monthlyExpenses: monthlyExpenses[0]?.total || 0,
        monthlyProfit: (monthlyRevenue[0]?.total || 0) - (monthlyExpenses[0]?.total || 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

module.exports = router;

