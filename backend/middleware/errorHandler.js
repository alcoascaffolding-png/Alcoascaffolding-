/**
 * Error Handler Middleware
 * Central error handling for the application
 */

const logger = require('../utils/logger');
const config = require('../config/app.config');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default error values
  let error = {
    message: err.message || 'Internal server error',
    statusCode: err.statusCode || 500,
    details: err.details || null
  };

  // Log error
  logger.error('Error occurred', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    error.message = 'Validation error';
    error.details = err.details || err.message;
  }

  if (err.name === 'UnauthorizedError') {
    error.statusCode = 401;
    error.message = 'Unauthorized access';
  }

  if (err.code === 'ECONNREFUSED') {
    error.statusCode = 503;
    error.message = 'Service unavailable';
    error.details = 'Unable to connect to email service';
  }

  // Handle Playwright browser errors
  if (err.message && err.message.includes('Playwright browser not installed')) {
    error.statusCode = 503;
    error.message = 'PDF generation service unavailable';
    error.details = err.message;
  }

  // Set CORS headers before sending response
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  }

  // Build response
  const response = {
    success: false,
    error: error.message,
    details: error.details || null
  };

  // Include stack trace in development mode only
  if (config.server.env === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  // Set CORS headers for 404 responses
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};

