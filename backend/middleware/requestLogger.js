/**
 * Request Logger Middleware
 * Logs incoming HTTP requests
 */

const logger = require('../utils/logger');

/**
 * Log incoming requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    if (res.statusCode >= 400) {
      logger.warn(`Request completed with error`, logData);
    } else {
      logger.info(`Request completed`, logData);
    }
  });

  next();
};

module.exports = requestLogger;

