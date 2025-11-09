/**
 * Resend Email Service Test Script
 * Run this to verify your Resend integration is working
 * 
 * Usage: node test-resend.js
 */

require('dotenv').config();
const resendService = require('./services/resend.service');

console.log('\n🧪 Testing Resend Email Service...\n');
console.log('Configuration:');
console.log('- RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('- RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'Not set');
console.log('- COMPANY_EMAIL:', process.env.COMPANY_EMAIL || 'Not set');
console.log('\n' + '='.repeat(50) + '\n');

async function testResend() {
  try {
    // Test 1: Configuration Test
    console.log('📋 Test 1: Testing email configuration...');
    const configTest = await resendService.testEmailConfig();
    
    if (configTest.success) {
      console.log('✅ Configuration test passed!');
      console.log('   Email ID:', configTest.emailId);
    } else {
      console.log('❌ Configuration test failed:', configTest.message);
      return;
    }

    console.log('\n' + '-'.repeat(50) + '\n');

    // Test 2: Contact Form Email
    console.log('📋 Test 2: Testing contact form email...');
    const contactData = {
      name: 'Test User',
      email: process.env.COMPANY_EMAIL || 'test@example.com',
      phone: '+971 50 123 4567',
      company: 'Test Company LLC',
      projectType: 'commercial',
      message: 'This is a test message from the Resend integration test script. If you receive this, your email service is working perfectly!'
    };

    const contactResult = await resendService.sendContactFormEmail(contactData);
    
    if (contactResult.success) {
      console.log('✅ Contact form email test passed!');
      console.log('   Company Email ID:', contactResult.emailIds.company);
      console.log('   Customer Email ID:', contactResult.emailIds.customer);
    } else {
      console.log('❌ Contact form email test failed');
    }

    console.log('\n' + '-'.repeat(50) + '\n');

    // Test 3: Quote Request Email
    console.log('📋 Test 3: Testing quote request email...');
    const quoteData = {
      name: 'Test User',
      email: process.env.COMPANY_EMAIL || 'test@example.com',
      phone: '+971 50 123 4567',
      company: 'Test Company LLC',
      projectType: 'industrial',
      projectHeight: '25',
      coverageArea: '500',
      duration: '3 months',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      message: 'This is a test quote request from the Resend integration test script.'
    };

    const quoteResult = await resendService.sendQuoteRequestEmail(quoteData);
    
    if (quoteResult.success) {
      console.log('✅ Quote request email test passed!');
      console.log('   Company Email ID:', quoteResult.emailIds.company);
      console.log('   Customer Email ID:', quoteResult.emailIds.customer);
    } else {
      console.log('❌ Quote request email test failed');
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 All tests completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Check your inbox at:', process.env.COMPANY_EMAIL);
    console.log('2. Verify all emails were received');
    console.log('3. Check email formatting and content');
    console.log('4. Test the contact form on your website\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure .env file exists in backend/ folder');
    console.error('2. Verify RESEND_API_KEY is correct');
    console.error('3. Check that all required env variables are set');
    console.error('4. Ensure you have internet connection');
    console.error('5. Check Resend dashboard for more details\n');
    
    if (error.stack) {
      console.error('Full error:', error.stack);
    }
  }
}

// Run the test
testResend();

