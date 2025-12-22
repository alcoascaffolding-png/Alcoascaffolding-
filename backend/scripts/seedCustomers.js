/**
 * Seed Customers Script
 * Creates test customer data for development
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

const seedCustomers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Check existing
    const existing = await Customer.countDocuments();
    if (existing >= 5) {
      console.log(`ℹ️  Already have ${existing} customers. Skipping seed.\n`);
      process.exit(0);
    }

    console.log('🔄 Creating test customers...\n');

    const customersData = [
      {
        companyName: 'Emirates Construction LLC',
        businessType: 'Construction Company',
        tradeLicenseNumber: 'CN-123456',
        vatRegistrationNumber: 'VAT-UAE-100001',
        primaryEmail: 'info@emiratesconstruction.ae',
        primaryPhone: '+971501234567',
        primaryWhatsApp: '+971501234567',
        status: 'active',
        customerType: 'both',
        priority: 'vip',
        paymentTerms: '30 Days',
        creditLimit: 100000,
        rating: 5,
        notes: 'VIP customer - Large construction projects',
        contactPersons: [
          {
            name: 'Ahmed Ali',
            designation: 'Project Manager',
            email: 'ahmed@emiratesconstruction.ae',
            phone: '+971501234567',
            whatsapp: '+971501234567',
            isPrimary: true,
            role: 'primary'
          }
        ],
        addresses: [
          {
            type: 'office',
            addressLine1: 'Building 123, Office 456',
            area: 'Business Bay',
            city: 'Dubai',
            emirate: 'Dubai',
            isPrimary: true
          }
        ]
      },
      {
        companyName: 'Sharjah Facilities Management',
        businessType: 'Facility Management',
        tradeLicenseNumber: 'CN-234567',
        primaryEmail: 'contracts@sharjahfm.ae',
        primaryPhone: '+971502345678',
        status: 'active',
        customerType: 'rental',
        priority: 'high',
        paymentTerms: '15 Days',
        creditLimit: 50000,
        rating: 4,
        contactPersons: [
          {
            name: 'Mohammed Hassan',
            designation: 'Operations Manager',
            email: 'mohammed@sharjahfm.ae',
            phone: '+971502345678',
            isPrimary: true,
            role: 'primary'
          }
        ],
        addresses: [
          {
            type: 'office',
            addressLine1: 'Al Nahda Road',
            city: 'Sharjah',
            emirate: 'Sharjah',
            isPrimary: true
          }
        ]
      },
      {
        companyName: 'Abu Dhabi Contractors',
        businessType: 'Contractor',
        primaryEmail: 'info@adcontractors.ae',
        primaryPhone: '+971503456789',
        status: 'active',
        customerType: 'rental',
        priority: 'medium',
        paymentTerms: 'Cash',
        creditLimit: 0,
        rating: 3,
        contactPersons: [
          {
            name: 'Khalid Ibrahim',
            email: 'khalid@adcontractors.ae',
            phone: '+971503456789',
            isPrimary: true,
            role: 'primary'
          }
        ],
        addresses: [
          {
            type: 'office',
            addressLine1: 'Mussafah Industrial Area',
            city: 'Abu Dhabi',
            emirate: 'Abu Dhabi',
            isPrimary: true
          }
        ]
      },
      {
        companyName: 'Ajman Development Company',
        businessType: 'Construction Company',
        primaryEmail: 'projects@ajmandev.ae',
        primaryPhone: '+971504567890',
        status: 'prospect',
        customerType: 'both',
        priority: 'medium',
        paymentTerms: 'Cash',
        rating: 3,
        contactPersons: [
          {
            name: 'Salem Ahmad',
            email: 'salem@ajmandev.ae',
            phone: '+971504567890',
            isPrimary: true,
            role: 'primary'
          }
        ],
        addresses: [
          {
            type: 'office',
            city: 'Ajman',
            emirate: 'Ajman',
            addressLine1: 'Al Rashidiya',
            isPrimary: true
          }
        ]
      },
      {
        companyName: 'RAK Industrial Solutions',
        businessType: 'Contractor',
        primaryEmail: 'admin@rakind.ae',
        primaryPhone: '+971505678901',
        status: 'active',
        customerType: 'rental',
        priority: 'low',
        paymentTerms: '7 Days',
        creditLimit: 25000,
        rating: 3,
        contactPersons: [
          {
            name: 'Rashid Khalil',
            email: 'rashid@rakind.ae',
            phone: '+971505678901',
            isPrimary: true,
            role: 'primary'
          }
        ],
        addresses: [
          {
            type: 'office',
            city: 'Ras Al Khaimah',
            emirate: 'Ras Al Khaimah',
            addressLine1: 'Industrial Zone',
            isPrimary: true
          }
        ]
      }
    ];

    for (const data of customersData) {
      const customer = new Customer(data);
      await customer.save();
      console.log(`✅ Created: ${customer.companyName}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS! Created 5 test customers');
    console.log('='.repeat(60));
    console.log('\n🌐 View in admin panel:');
    console.log('   http://localhost:5174/customers\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    process.exit(1);
  }
};

// Run the script
seedCustomers();

