/**
 * Product Routes - Full CRUD Operations
 */

const express = require('express');
const router = express.Router();
const controllerFactory = require('../utils/controllerFactory');
const Product = require('../models/Product');
const optionalAuth = require('../middleware/optionalAuth');

router.use(optionalAuth);

const controller = controllerFactory(Product);

router.get('/', controller.getAll);
router.get('/stats', async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          inStock: { $sum: { $cond: [{ $gt: ['$currentStock', 0] }, 1, 0] } },
          lowStock: { $sum: { $cond: [{ $lte: ['$currentStock', '$reorderLevel'] }, 1, 0] } },
          totalValue: { $sum: { $multiply: ['$currentStock', '$sellingPrice'] } }
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

