/**
 * Email Configuration
 * Handles nodemailer transporter setup and email-related configurations
 * Supports both SendGrid (recommended for production) and Gmail SMTP
 */

const nodemailer = require('nodemailer');

// Determine which email service to use
const useSendGrid = !!process.env.SENDGRID_API_KEY;

// SendGrid configuration (recommended for cloud hosting)
const sendGridConfig = {
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: 'apikey', // SendGrid uses 'apikey' as username
    pass: process.env.SENDGRID_API_KEY
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10,
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000,
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development'
};

// Gmail SMTP configuration (for local development or if SendGrid not configured)
const gmailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 10,
  rateDelta: 1000,
  rateLimit: 3,
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,
  socketTimeout: 60000,
  requireTLS: true,
  tls: {
    minVersion: 'TLSv1.2'
  },
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development'
};

// Use SendGrid if API key is provided, otherwise use Gmail
const emailConfig = useSendGrid ? sendGridConfig : gmailConfig;

// Company email recipients
const recipients = {
  primary: process.env.COMPANY_EMAIL || process.env.EMAIL_USER,  // Main recipient email
  secondary: process.env.SECONDARY_EMAIL || process.env.COMPANY_EMAIL || process.env.EMAIL_USER,
  support: process.env.SUPPORT_EMAIL || process.env.COMPANY_EMAIL || process.env.EMAIL_USER
};

// Create reusable transporter
const createTransporter = () => {
  try {
    // Check if credentials are configured based on the service being used
    if (useSendGrid) {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SendGrid API key not configured. Please set SENDGRID_API_KEY environment variable.');
        throw new Error('SendGrid API key not configured');
      }
      console.log('📧 Using SendGrid for email delivery (recommended for production)');
    } else {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Gmail credentials not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
        console.error('💡 For production, consider using SendGrid by setting SENDGRID_API_KEY');
        throw new Error('Email credentials not configured');
      }
      console.log('📧 Using Gmail SMTP for email delivery');
    }

    const transporter = nodemailer.createTransport(emailConfig);
    
    // Verify transporter configuration (async, non-blocking)
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
        if (useSendGrid) {
          console.error('Please check your SendGrid configuration:');
          console.error('1. SENDGRID_API_KEY is valid and not expired');
          console.error('2. SendGrid account is active and verified');
          console.error('3. Domain is verified in SendGrid (if using custom domain)');
        } else {
          console.error('Please check your Gmail credentials and ensure:');
          console.error('1. EMAIL_USER is correct');
          console.error('2. EMAIL_PASS is a valid Gmail App Password');
          console.error('3. 2-Step Verification is enabled on Gmail');
          console.error('💡 Note: Gmail SMTP may not work on cloud hosting. Consider using SendGrid.');
        }
      } else {
        console.log(`✅ Email transporter is ready to send messages via ${useSendGrid ? 'SendGrid' : 'Gmail'}`);
      }
    });
    
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    throw error;
  }
};

// Email sender details - use appropriate email based on service
const getSenderEmail = () => {
  if (useSendGrid) {
    // For SendGrid, you can use a verified sender email
    return process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@alcoascaffolding.com';
  }
  return process.env.EMAIL_USER;
};

const senderInfo = {
  from: `"Alcoa Scaffolding" <${getSenderEmail()}>`,
  replyTo: process.env.EMAIL_USER || process.env.COMPANY_EMAIL
};

module.exports = {
  emailConfig,
  recipients,
  createTransporter,
  senderInfo,
  useSendGrid
};

