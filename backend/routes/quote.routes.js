/**
 * Quote Routes - Full CRUD Operations
 */

const express = require('express');
const router = express.Router();
const controllerFactory = require('../utils/controllerFactory');
const Quote = require('../models/Quote');
const optionalAuth = require('../middleware/optionalAuth');
const transformQuoteData = require('../middleware/quoteTransform');

// Apply optional authentication
router.use(optionalAuth);

// Use controller factory to generate all routes
const quoteController = controllerFactory(Quote);

// Standard CRUD routes
router.get('/', quoteController.getAll);
router.get('/stats', async (req, res) => {
  try {
    const stats = await Quote.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $in: ['$status', ['draft', 'sent']] }, 1, 0] } },
          totalValue: { $sum: '$total' }
        }
      }
    ]);
    res.json({ success: true, data: stats[0] || { total: 0, accepted: 0, pending: 0, totalValue: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/:id', quoteController.getById);
router.post('/', transformQuoteData, quoteController.create);
router.put('/:id', transformQuoteData, quoteController.update);
router.delete('/:id', quoteController.delete);

module.exports = router;

