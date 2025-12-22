/**
 * Test Environment Variables
 * Run this to check if environment variables are loaded correctly
 */

require('dotenv').config();

console.log('🔍 Environment Variables Test:');
console.log('================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
console.log('COMPANY_EMAIL:', process.env.COMPANY_EMAIL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('================================');

// Test Resend service
try {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend client created successfully');
} catch (error) {
  console.error('❌ Resend client creation failed:', error.message);
}

console.log('Test completed!');
