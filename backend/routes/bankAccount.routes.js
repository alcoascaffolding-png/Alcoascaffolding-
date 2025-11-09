/**
 * Bank Account Routes - Full CRUD Operations
 */

const express = require('express');
const router = express.Router();
const controllerFactory = require('../utils/controllerFactory');
const BankAccount = require('../models/BankAccount');
const optionalAuth = require('../middleware/optionalAuth');

router.use(optionalAuth);

const controller = controllerFactory(BankAccount);

router.get('/', controller.getAll);
router.get('/stats', async (req, res) => {
  try {
    const stats = await BankAccount.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalBalance: { $sum: '$currentBalance' }
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

