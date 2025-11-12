/**
 * Check and Fix Admin User
 * This will show existing users and create/update admin with working credentials
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const checkAndFix = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Check all existing users
    const allUsers = await User.find({}).select('name email role isActive');
    console.log('📊 EXISTING USERS IN DATABASE:');
    console.log('=' .repeat(60));
    
    if (allUsers.length === 0) {
      console.log('❌ NO USERS FOUND! Database is empty.\n');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log('');
      });
    }

    // Find or create admin
    let admin = await User.findOne({ email: 'admin@alcoa.com' });
    
    if (admin) {
      console.log('✅ Found existing admin@alcoa.com');
      console.log('🔄 Updating password to: admin123\n');
      
      // Update password
      admin.password = 'admin123';
      admin.isActive = true;
      await admin.save();
      
      console.log('✅ Password updated successfully!');
    } else {
      console.log('❌ admin@alcoa.com not found');
      console.log('🔄 Creating new admin user...\n');
      
      // Create new admin
      admin = new User({
        name: 'Admin',
        email: 'admin@alcoa.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        permissions: ['all']
      });
      
      await admin.save();
      console.log('✅ New admin user created!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS! You can now login with:');
    console.log('='.repeat(60));
    console.log('📧 Email: admin@alcoa.com');
    console.log('🔑 Password: admin123');
    console.log('🌐 URL: http://localhost:5174/login');
    console.log('='.repeat(60));
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

// Run the script
checkAndFix();

