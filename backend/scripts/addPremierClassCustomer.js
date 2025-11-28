/**
 * Add Premier Class Building Contracting Customer
 * Script to add the customer from the screenshot to the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

const addPremierClassCustomer = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [
        { companyName: 'Premier Class Building Contracting' },
        { primaryPhone: '05499466009' },
        { primaryPhone: '+9715499466009' }
      ]
    });

    if (existingCustomer) {
      console.log('ℹ️  Customer already exists:');
      console.log(`   Company: ${existingCustomer.companyName}`);
      console.log(`   Phone: ${existingCustomer.primaryPhone}`);
      console.log(`   ID: ${existingCustomer._id}\n`);
      process.exit(0);
    }

    console.log('🔄 Creating Premier Class Building Contracting customer...\n');

    // Format phone number (UAE format)
    const phoneNumber = '05499466009';
    const formattedPhone = phoneNumber.startsWith('0') 
      ? `+971${phoneNumber.substring(1)}` 
      : phoneNumber.startsWith('+971') 
        ? phoneNumber 
        : `+971${phoneNumber}`;

    const customerData = {
      companyName: 'Premier Class Building Contracting',
      displayName: 'Premier Class Building Contracting',
      businessType: 'Construction Company',
      primaryEmail: '', // Can be added later
      primaryPhone: formattedPhone,
      primaryWhatsApp: formattedPhone,
      status: 'active',
      customerType: 'both',
      priority: 'medium',
      paymentTerms: 'Cash',
      creditLimit: 0,
      rating: 3,
      notes: 'Customer added from screenshot - Premier Class Building Contracting',
      contactPersons: [
        {
          name: 'Primary Contact',
          phone: formattedPhone,
          whatsapp: formattedPhone,
          isPrimary: true,
          role: 'primary'
        }
      ],
      addresses: [
        {
          type: 'office',
          addressLine1: 'Address to be updated',
          city: 'Dubai',
          emirate: 'Dubai',
          country: 'UAE',
          isPrimary: true
        }
      ]
    };

    const customer = new Customer(customerData);
    await customer.save();

    console.log('✅ Successfully created customer:');
    console.log('='.repeat(60));
    console.log(`   Company Name: ${customer.companyName}`);
    console.log(`   Phone: ${customer.primaryPhone}`);
    console.log(`   WhatsApp: ${customer.primaryWhatsApp}`);
    console.log(`   Status: ${customer.status}`);
    console.log(`   Customer Type: ${customer.customerType}`);
    console.log(`   Payment Terms: ${customer.paymentTerms}`);
    console.log(`   Customer ID: ${customer._id}`);
    console.log('='.repeat(60));
    console.log('\n🌐 View in admin panel:');
    console.log(`   http://localhost:5174/customers/${customer._id}\n`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding customer:', error);
    if (error.code === 11000) {
      console.error('   Duplicate entry detected. Customer may already exist.');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
addPremierClassCustomer();

