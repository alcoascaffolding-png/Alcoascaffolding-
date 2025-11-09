/**
 * Create Admin User Script
 * Run: node scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User schema inline to avoid dependency issues
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'manager', 'accountant', 'sales', 'inventory', 'viewer'],
    default: 'viewer',
  },
  permissions: [String],
  department: {
    type: String,
    default: 'operations',
  },
  phone: String,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@alcoa.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email: admin@alcoa.com');
      console.log('If you forgot the password, please reset it manually in the database.');
      process.exit(0);
    }

    // Hash password
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@alcoa.com',
      password: hashedPassword,
      role: 'super_admin',
      permissions: [],
      department: 'management',
      phone: '',
      isActive: true,
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('  Default Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('  Email:    admin@alcoa.com');
    console.log('  Password: admin123');
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  IMPORTANT: Please change the password after first login!\n');

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdmin();

