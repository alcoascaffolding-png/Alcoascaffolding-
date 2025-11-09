/**
 * Optional Authentication Middleware
 * For development - allows requests without authentication
 */

const config = require('../config/app.config');

const optionalAuth = (req, res, next) => {
  // In development mode, skip authentication
  if (config.server.env === 'development') {
    // Create a mock user for development
    req.user = {
      _id: 'dev-user',
      email: 'admin@alcoa.com',
      role: 'admin',
      isActive: true
    };
    return next();
  }
  
  // In production, authentication is required
  // This will be handled by the authenticate middleware
  next();
};

module.exports = optionalAuth;

