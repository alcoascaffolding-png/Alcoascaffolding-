/**
 * Security Middleware
 * Additional security measures for the application
 */

const logger = require('../utils/logger');

/**
 * Sanitize request body to prevent XSS attacks
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potentially dangerous HTML/Script content
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove inline event handlers
          .replace(/on\w+\s*=\s*'[^']*'/gi, '');
      }
    });
  }
  next();
};

/**
 * Check for suspicious patterns in request
 */
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\(/i,
    /expression\(/i
  ];

  const requestStr = JSON.stringify(req.body);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestStr)) {
      logger.warn('Suspicious activity detected', {
        ip: req.ip,
        path: req.path,
        pattern: pattern.toString()
      });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid request content'
      });
    }
  }
  
  next();
};

/**
 * CORS preflight handler
 */
const handleCORS = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow credentials
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Set origin header if present (cors package should handle this, but we ensure it's set)
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(200).end();
  }
  
  next();
};

module.exports = {
  sanitizeRequest,
  detectSuspiciousActivity,
  handleCORS
};

