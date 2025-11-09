/**
 * Sales Invoice Routes - Full CRUD Operations
 */

const express = require('express');
const router = express.Router();
const controllerFactory = require('../utils/controllerFactory');
const SalesInvoice = require('../models/SalesInvoice');
const optionalAuth = require('../middleware/optionalAuth');

router.use(optionalAuth);

const controller = controllerFactory(SalesInvoice);

router.get('/', controller.getAll);
router.get('/stats', async (req, res) => {
  try {
    const stats = await SalesInvoice.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'overdue'] }, 1, 0] } },
          totalValue: { $sum: '$total' },
          totalPaid: { $sum: '$paidAmount' }
        }
      }
    ]);
    res.json({ success: true, data: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;

