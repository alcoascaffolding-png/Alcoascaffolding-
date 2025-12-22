/**
 * Reset Admin Password Script
 * Updates the password for an existing admin user
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetPassword = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'system@alcoa.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    // Update password
    admin.password = 'admin123'; // Will be hashed by pre-save middleware
    await admin.save();

    console.log('');
    console.log('🎉 Password reset successful!');
    console.log('');
    console.log('📧 Email: system@alcoa.com');
    console.log('🔑 New Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after login!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
};

// Run the script
resetPassword();

