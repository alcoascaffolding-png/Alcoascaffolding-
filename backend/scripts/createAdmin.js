/**
 * Create Admin User Script
 * Run this to create a default admin user for first-time login
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ ERROR: MONGODB_URI not found in .env file');
      process.exit(1);
    }
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@alcoa.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@alcoa.com',
      password: 'admin123', // Will be hashed by pre-save middleware
      role: 'admin',
      isActive: true,
      permissions: ['all']
    });

    await adminUser.save();

    console.log('');
    console.log('🎉 Admin user created successfully!');
    console.log('');
    console.log('📧 Email: admin@alcoa.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdminUser();
