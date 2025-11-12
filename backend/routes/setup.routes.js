/**
 * Setup Routes
 * One-time setup endpoints (disable in production!)
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Create default admin user
 * POST /api/setup/create-admin
 * 
 * IMPORTANT: This should be disabled after initial setup!
 */
router.post('/create-admin', async (req, res) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists. Cannot create duplicate admin.',
        existing: {
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      });
    }

    // Create admin user with provided data or defaults
    const adminData = {
      name: req.body.name || 'Admin',
      email: req.body.email || 'admin@alcoa.com',
      password: req.body.password || 'admin123',
      role: 'admin',
      isActive: true,
      permissions: ['all']
    };

    const admin = new User(adminData);
    await admin.save();

    logger.info('Admin user created via setup endpoint', { email: admin.email });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully!',
      data: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        note: 'IMPORTANT: Change the password after first login!'
      }
    });
  } catch (error) {
    logger.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
});

/**
 * Check setup status
 * GET /api/setup/status
 */
router.get('/status', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        hasAdmin: adminCount > 0,
        adminCount,
        totalUsers: userCount,
        setupComplete: adminCount > 0
      }
    });
  } catch (error) {
    logger.error('Error checking setup status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check setup status',
      error: error.message
    });
  }
});

/**
 * Reset admin password
 * POST /api/setup/reset-password
 * Body: { email: "admin@example.com", newPassword: "newpass123" }
 * 
 * IMPORTANT: This should be disabled after use!
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and newPassword are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    logger.info('Password reset via setup endpoint', { email: user.email });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully!',
      data: {
        email: user.email,
        name: user.name,
        note: 'You can now login with the new password'
      }
    });
  } catch (error) {
    logger.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

module.exports = router;

