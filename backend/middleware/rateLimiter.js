/**
 * Rate Limiter Middleware
 * Configures rate limiting for different endpoints
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/app.config');
const logger = require('../utils/logger');

/**
 * Custom rate limit handler
 */
const rateLimitHandler = (req, res) => {
  logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
    path: req.path,
    method: req.method
  });
  
  res.status(429).json({
    success: false,
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: res.getHeader('Retry-After')
  });
};

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  ...config.rateLimit.api,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/api/health';
  }
});

/**
 * Email-specific rate limiter (stricter)
 */
const emailLimiter = rateLimit({
  ...config.rateLimit.email,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    // Rate limit by IP and email address combination
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  }
});

/**
 * Strict limiter for sensitive endpoints
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Too many requests from this IP, please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

module.exports = {
  apiLimiter,
  emailLimiter,
  strictLimiter
};

