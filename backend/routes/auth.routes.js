/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, restrictTo } = require('../middleware/auth');
const authConfig = require('../config/auth.config');

// Public routes
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/update-profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);

// Admin only routes
router.post('/register', 
  restrictTo(authConfig.roles.SUPER_ADMIN, authConfig.roles.ADMIN),
  authController.register
);

module.exports = router;

