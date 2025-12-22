/**
 * Seed Quotations Script
 * Creates test quotation data for development
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');

const seedQuotations = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get existing customers
    const customers = await Customer.find().limit(5);
    
    if (customers.length === 0) {
      console.log('❌ No customers found! Please create customers first.');
      process.exit(1);
    }

    console.log(`📊 Found ${customers.length} customers\n`);

    // Clear existing quotations
    await Quotation.deleteMany({});
    console.log('🗑️  Cleared existing quotations\n');

    // Sample quotation data
    const quotationsData = [
      {
        customer: customers[0]._id,
        customerName: customers[0].companyName,
        customerEmail: customers[0].primaryEmail,
        customerPhone: customers[0].primaryPhone,
        quoteType: 'rental',
        status: 'sent',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        items: [
          {
            equipmentType: 'Single Width Scaffolding',
            equipmentCode: 'SWS-001',
            description: 'Mobile aluminium scaffolding tower, 3m working height',
            quantity: 2,
            rentalDuration: { value: 30, unit: 'day' },
            ratePerUnit: 150,
            subtotal: 9000
          },
          {
            equipmentType: 'Safety Harness',
            equipmentCode: 'SH-001',
            description: 'Full body safety harness',
            quantity: 4,
            rentalDuration: { value: 30, unit: 'day' },
            ratePerUnit: 50,
            subtotal: 6000
          }
        ],
        subtotal: 15000,
        deliveryCharges: 200,
        installationCharges: 500,
        pickupCharges: 200,
        discount: 0,
        vatPercentage: 5,
        notes: 'Standard rental terms apply. Equipment must be returned in good condition.',
        termsAndConditions: '1. Payment due within 7 days\n2. Late returns subject to additional charges\n3. Customer responsible for equipment safety'
      },
      {
        customer: customers[1] ? customers[1]._id : customers[0]._id,
        customerName: customers[1] ? customers[1].companyName : customers[0].companyName,
        customerEmail: customers[1] ? customers[1].primaryEmail : customers[0].primaryEmail,
        customerPhone: customers[1] ? customers[1].primaryPhone : customers[0].primaryPhone,
        quoteType: 'sales',
        status: 'approved',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        items: [
          {
            equipmentType: 'Aluminium Ladder',
            equipmentCode: 'AL-001',
            description: '6-step aluminium A-type ladder',
            quantity: 10,
            ratePerUnit: 450,
            subtotal: 4500
          },
          {
            equipmentType: 'Steel Planks',
            equipmentCode: 'SP-001',
            description: 'Anti-slip steel scaffold planks, 2.5m',
            quantity: 20,
            ratePerUnit: 180,
            subtotal: 3600
          }
        ],
        subtotal: 8100,
        deliveryCharges: 300,
        installationCharges: 0,
        pickupCharges: 0,
        discount: 500,
        discountType: 'fixed',
        vatPercentage: 5,
        notes: 'Bulk order discount applied',
        termsAndConditions: '1. Payment on delivery\n2. 1-year warranty on all products\n3. Free delivery for orders over AED 5000'
      },
      {
        customer: customers[2] ? customers[2]._id : customers[0]._id,
        customerName: customers[2] ? customers[2].companyName : customers[0].companyName,
        customerEmail: customers[2] ? customers[2].primaryEmail : customers[0].primaryEmail,
        customerPhone: customers[2] ? customers[2].primaryPhone : customers[0].primaryPhone,
        quoteType: 'both',
        status: 'draft',
        validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        items: [
          {
            equipmentType: 'Double Width Scaffolding',
            equipmentCode: 'DWS-001',
            description: 'Heavy-duty mobile tower, 5m working height',
            quantity: 1,
            rentalDuration: { value: 2, unit: 'month' },
            ratePerUnit: 2500,
            subtotal: 5000
          },
          {
            equipmentType: 'Couplers Set',
            equipmentCode: 'CS-001',
            description: 'Complete set of scaffolding couplers',
            quantity: 1,
            ratePerUnit: 850,
            subtotal: 850
          }
        ],
        subtotal: 5850,
        deliveryCharges: 150,
        installationCharges: 400,
        pickupCharges: 150,
        discount: 0,
        vatPercentage: 5,
        notes: 'Draft - awaiting customer approval'
      },
      {
        customer: customers[0]._id,
        customerName: customers[0].companyName,
        customerEmail: customers[0].primaryEmail,
        customerPhone: customers[0].primaryPhone,
        quoteType: 'rental',
        status: 'expired',
        validUntil: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        items: [
          {
            equipmentType: 'Stairway Scaffolding',
            equipmentCode: 'STS-001',
            description: 'Mobile tower with internal stairway',
            quantity: 1,
            rentalDuration: { value: 1, unit: 'week' },
            ratePerUnit: 800,
            subtotal: 800
          }
        ],
        subtotal: 800,
        deliveryCharges: 100,
        installationCharges: 0,
        pickupCharges: 100,
        discount: 0,
        vatPercentage: 5,
        notes: 'Customer did not respond within validity period'
      },
      {
        customer: customers[1] ? customers[1]._id : customers[0]._id,
        customerName: customers[1] ? customers[1].companyName : customers[0].companyName,
        customerEmail: customers[1] ? customers[1].primaryEmail : customers[0].primaryEmail,
        customerPhone: customers[1] ? customers[1].primaryPhone : customers[0].primaryPhone,
        quoteType: 'rental',
        status: 'rejected',
        validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        items: [
          {
            equipmentType: 'Folding Tower',
            equipmentCode: 'FT-001',
            description: 'Compact folding scaffold tower',
            quantity: 3,
            rentalDuration: { value: 14, unit: 'day' },
            ratePerUnit: 120,
            subtotal: 5040
          }
        ],
        subtotal: 5040,
        deliveryCharges: 150,
        installationCharges: 0,
        pickupCharges: 150,
        discount: 0,
        vatPercentage: 5,
        notes: 'Customer found alternative supplier'
      }
    ];

    // Create quotations
    console.log('🔄 Creating quotations...\n');
    
    for (const data of quotationsData) {
      const quoteNumber = await Quotation.generateQuoteNumber();
      const quotation = new Quotation({
        ...data,
        quoteNumber
      });
      await quotation.save();
      
      console.log(`✅ Created: ${quoteNumber}`);
      console.log(`   Customer: ${data.customerName}`);
      console.log(`   Type: ${data.quoteType}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Amount: AED ${quotation.totalAmount.toLocaleString()}`);
      console.log('');
    }

    console.log('=' .repeat(60));
    console.log('🎉 SUCCESS! Created 5 test quotations');
    console.log('=' .repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   • Drafts: 1`);
    console.log(`   • Sent: 1`);
    console.log(`   • Approved: 1`);
    console.log(`   • Rejected: 1`);
    console.log(`   • Expired: 1`);
    console.log('\n🌐 View in admin panel:');
    console.log('   http://localhost:5174/quotes\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding quotations:', error);
    process.exit(1);
  }
};

// Run the script
seedQuotations();

