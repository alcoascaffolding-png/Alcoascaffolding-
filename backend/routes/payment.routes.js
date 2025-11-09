/**
 * Payment Routes - Full CRUD Operations
 */

const express = require('express');
const router = express.Router();
const controllerFactory = require('../utils/controllerFactory');
const Payment = require('../models/Payment');
const optionalAuth = require('../middleware/optionalAuth');

router.use(optionalAuth);

const controller = controllerFactory(Payment);

router.get('/', controller.getAll);
router.get('/stats', async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
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

