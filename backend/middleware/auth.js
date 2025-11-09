/**
 * Authentication Middleware
 * JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('../config/auth.config');
const logger = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in to access this resource.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, authConfig.jwt.secret);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password was recently changed. Please log in again.'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }

    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

/**
 * Restrict access to specific roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }

    next();
  };
};

/**
 * Check if user has specific permission
 */
const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Super admin has all permissions
    if (req.user.role === authConfig.roles.SUPER_ADMIN) {
      return next();
    }

    // Check if user has required permissions
    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to perform this action.',
        requiredPermissions
      });
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, authConfig.jwt.secret);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  restrictTo,
  checkPermission,
  optionalAuth
};

