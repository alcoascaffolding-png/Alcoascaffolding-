/**
 * Stock Adjustment Routes - Full CRUD Operations
 */

const express = require('express');
const router = express.Router();
const controllerFactory = require('../utils/controllerFactory');
const StockAdjustment = require('../models/StockAdjustment');
const optionalAuth = require('../middleware/optionalAuth');

router.use(optionalAuth);

const controller = controllerFactory(StockAdjustment);

router.get('/', controller.getAll);
router.get('/stats', async (req, res) => {
  try {
    const stats = await StockAdjustment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          additions: { $sum: { $cond: [{ $eq: ['$adjustmentType', 'addition'] }, 1, 0] } },
          reductions: { $sum: { $cond: [{ $eq: ['$adjustmentType', 'reduction'] }, 1, 0] } }
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

