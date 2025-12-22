/**
 * Logger Utility
 * Provides consistent logging across the application
 */

const config = require('../config/app.config');

class Logger {
  constructor() {
    this.config = config.logging;
  }

  /**
   * Format log message with timestamp
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toLocaleString('en-AE', { 
      timeZone: 'Asia/Dubai' 
    });
    
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      logMessage += `\n${JSON.stringify(data, null, 2)}`;
    }
    
    return logMessage;
  }

  /**
   * Info level logging
   */
  info(message, data = null) {
    if (this.config.enableConsole) {
      console.log(this.formatMessage('info', `ℹ️  ${message}`, data));
    }
  }

  /**
   * Success level logging
   */
  success(message, data = null) {
    if (this.config.enableConsole) {
      console.log(this.formatMessage('success', `✅ ${message}`, data));
    }
  }

  /**
   * Warning level logging
   */
  warn(message, data = null) {
    if (this.config.enableConsole) {
      console.warn(this.formatMessage('warning', `⚠️  ${message}`, data));
    }
  }

  /**
   * Error level logging
   */
  error(message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      ...(error.response && { response: error.response })
    } : null;
    
    if (this.config.enableConsole) {
      console.error(this.formatMessage('error', `❌ ${message}`, errorData));
    }
  }

  /**
   * Debug level logging (only in development)
   */
  debug(message, data = null) {
    if (config.server.env === 'development' && this.config.enableConsole) {
      console.log(this.formatMessage('debug', `🔍 ${message}`, data));
    }
  }

  /**
   * Email activity logging
   */
  emailSent(type, recipient, details = {}) {
    this.success(`Email sent - Type: ${type}, To: ${recipient}`, details);
  }

  /**
   * Email error logging
   */
  emailError(type, error, details = {}) {
    this.error(`Email failed - Type: ${type}`, error);
    this.debug('Email error details', details);
  }

  /**
   * API request logging
   */
  apiRequest(method, path, ip) {
    this.info(`API Request: ${method} ${path} from ${ip}`);
  }

  /**
   * Server startup logging
   */
  serverStarted(port, env) {
    console.log('\n🚀 ====================================');
    this.success(`Server running on port ${port}`);
    this.info(`Environment: ${env}`);
    this.info(`Frontend URL: ${config.server.frontendUrl}`);
    this.info(`Email User: ${process.env.EMAIL_USER || 'Not configured'}`);
    console.log('🔒 Security: Helmet & CORS enabled');
    console.log('⚡ Rate limiting active');
    console.log('====================================\n');
    
    // Warn if email is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      this.warn('Email credentials not configured!');
      this.warn('Please create a .env file from env.example\n');
    }
  }
}

module.exports = new Logger();

