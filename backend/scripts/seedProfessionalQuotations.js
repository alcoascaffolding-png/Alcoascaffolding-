/**
 * Seed Professional Quotations Script
 * Creates test quotations with all professional fields
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');

const seedProfessionalQuotations = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get existing customers
    const customers = await Customer.find().limit(5);
    
    if (customers.length === 0) {
      console.log('❌ No customers found! Please run seedCustomers.js first.');
      process.exit(1);
    }

    console.log(`📊 Found ${customers.length} customers\n`);

    // Clear existing quotations
    await Quotation.deleteMany({});
    console.log('🗑️  Cleared existing quotations\n');

    // Professional quotation data
    const quotationsData = [
      {
        customer: customers[0]._id,
        customerName: customers[0].companyName,
        customerAddress: `${customers[0].addresses?.[0]?.addressLine1 || 'Business Bay'}, ${customers[0].addresses?.[0]?.city || 'Dubai'}`,
        customerEmail: customers[0].primaryEmail,
        customerPhone: customers[0].primaryPhone,
        customerTRN: customers[0].vatRegistrationNumber || '100615007000003',
        contactPersonName: customers[0].contactPersons?.[0]?.name || 'Ahmed Ali',
        contactPersonDesignation: customers[0].contactPersons?.[0]?.designation || 'Project Manager',
        contactPersonEmail: customers[0].contactPersons?.[0]?.email || customers[0].primaryEmail,
        contactPersonPhone: customers[0].contactPersons?.[0]?.phone || customers[0].primaryPhone,
        subject: 'HIRE OF ALUMINIUM SCAFFOLDING FOR 1 MONTH',
        salesExecutive: 'JAMAL AJMAL',
        preparedBy: 'Sales Team',
        customerPONumber: 'PO/2025/001',
        paymentTerms: 'Cash/CDC',
        deliveryTerms: '7-10 days from date of order',
        projectDuration: '1 Month (05-11-2025 to 05-12-2025)',
        quoteType: 'rental',
        status: 'sent',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        items: [
          {
            equipmentType: 'Single Width Scaffolding Tower',
            equipmentCode: 'SWS-001',
            description: 'Mobile aluminium scaffolding, 3m working height',
            size: '0.75m x 2m x 3m',
            weight: 85.5,
            cbm: 0.45,
            quantity: 2,
            unit: 'Set',
            rentalDuration: { value: 30, unit: 'day' },
            ratePerUnit: 150,
            subtotal: 9000
          },
          {
            equipmentType: 'Double Width Scaffolding',
            equipmentCode: 'DWS-001',
            description: 'Heavy-duty mobile tower, 5m working height',
            size: '1.4m x 2.5m x 5m',
            weight: 145.2,
            cbm: 1.75,
            quantity: 1,
            unit: 'Set',
            rentalDuration: { value: 30, unit: 'day' },
            ratePerUnit: 250,
            subtotal: 7500
          },
          {
            equipmentType: 'Safety Equipment Bundle',
            equipmentCode: 'SB-001',
            description: 'Full body harness, hard hats, safety nets',
            quantity: 1,
            unit: 'Set',
            rentalDuration: { value: 30, unit: 'day' },
            ratePerUnit: 300,
            subtotal: 300
          }
        ],
        subtotal: 16800,
        deliveryCharges: 200,
        installationCharges: 1500,
        pickupCharges: 200,
        discount: 0,
        vatPercentage: 5,
        notes: 'All equipment is certified and meets UAE safety standards. Installation and training included.',
        termsAndConditions: `1. Payment: Cash/CDC on delivery
2. Delivery: 7-10 days from date of order
3. Installation: Certified team will install within 24 hours of delivery
4. Our products are made of high grade Alloy 6082
5. Manufactured as per BS EN 1004 Standard
6. 5 Years welding warranty on all products
7. Safety certifications included
8. Equipment must be returned in good condition`
      },
      {
        customer: customers[1]._id,
        customerName: customers[1].companyName,
        customerAddress: `${customers[1].addresses?.[0]?.city || 'Sharjah'}, UAE`,
        customerEmail: customers[1].primaryEmail,
        customerPhone: customers[1].primaryPhone,
        contactPersonName: customers[1].contactPersons?.[0]?.name || 'Contact Person',
        subject: 'SUPPLY OF ALUMINIUM LADDERS AND CUPLOCK SCAFFOLDING',
        salesExecutive: 'NIKHIL KUMAR',
        customerPONumber: 'SFM/2025/045',
        paymentTerms: 'CDC/Cash on delivery',
        deliveryTerms: '10 days from date of PO',
        quoteType: 'sales',
        status: 'approved',
        validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        items: [
          {
            equipmentType: 'Cuplock Ledger',
            equipmentCode: 'CL-2.5M',
            description: '48.3 x 3.22mm x 2.5M (Painted)',
            weight: 8.5,
            cbm: 0.012,
            quantity: 100,
            unit: 'Nos',
            ratePerUnit: 45,
            subtotal: 4500
          },
          {
            equipmentType: 'Cuplock Standard',
            equipmentCode: 'CS-3M',
            description: '48.3 x 3.2mm x 3.0M (Painted)',
            weight: 12.3,
            cbm: 0.018,
            quantity: 50,
            unit: 'Nos',
            ratePerUnit: 65,
            subtotal: 3250
          },
          {
            equipmentType: 'Aluminium A-Type Ladder',
            equipmentCode: 'AL-6',
            description: '6-step dual purpose ladder',
            weight: 8.5,
            cbm: 0.15,
            quantity: 10,
            unit: 'Nos',
            ratePerUnit: 450,
            subtotal: 4500
          }
        ],
        subtotal: 12250,
        deliveryCharges: 500,
        installationCharges: 0,
        pickupCharges: 0,
        discount: 750,
        discountType: 'fixed',
        vatPercentage: 5,
        notes: 'Bulk order discount applied. Free delivery for orders over AED 10,000',
        termsAndConditions: `1. Payment on delivery
2. 1-year warranty on all products
3. Manufactured as per BS EN 1004 Standard
4. High grade Alloy 6082 material`
      },
      {
        customer: customers[2]._id,
        customerName: customers[2].companyName,
        customerAddress: `${customers[2].addresses?.[0]?.city || 'Abu Dhabi'}, UAE`,
        customerEmail: customers[2].primaryEmail,
        customerPhone: customers[2].primaryPhone,
        subject: 'QUOTATION FOR SCAFFOLDING RENTAL WITH INSTALLATION',
        salesExecutive: 'AHMED SALEH',
        paymentTerms: 'Cash',
        deliveryTerms: '5-7 days',
        projectDuration: '2 Weeks',
        quoteType: 'both',
        status: 'draft',
        validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        items: [
          {
            equipmentType: 'Stairway Scaffolding',
            equipmentCode: 'STS-001',
            description: 'With internal stairway access',
            size: '1.4m x 2.5m x 6m',
            weight: 165,
            cbm: 2.1,
            quantity: 1,
            unit: 'Set',
            rentalDuration: { value: 2, unit: 'week' },
            ratePerUnit: 400,
            subtotal: 800
          },
          {
            equipmentType: 'Installation Service',
            description: 'Professional installation by certified team',
            quantity: 1,
            unit: 'Service',
            ratePerUnit: 800,
            subtotal: 800
          },
          {
            equipmentType: 'Disassembly Service',
            description: 'Safe disassembly and removal',
            quantity: 1,
            unit: 'Service',
            ratePerUnit: 600,
            subtotal: 600
          }
        ],
        subtotal: 2200,
        deliveryCharges: 150,
        installationCharges: 0,
        pickupCharges: 0,
        discount: 0,
        vatPercentage: 5,
        notes: 'Installation and disassembly services included in pricing'
      }
    ];

    // Create quotations
    console.log('🔄 Creating professional quotations...\n');
    
    for (const data of quotationsData) {
      const quoteNumber = await Quotation.generateQuoteNumber();
      const quotation = new Quotation({
        ...data,
        quoteNumber
      });
      await quotation.save();
      
      console.log(`✅ Created: ${quoteNumber}`);
      console.log(`   Customer: ${data.customerName}`);
      console.log(`   Subject: ${data.subject}`);
      console.log(`   Type: ${data.quoteType.toUpperCase()}`);
      console.log(`   Amount: AED ${quotation.totalAmount.toLocaleString()}`);
      console.log(`   Sales Exec: ${data.salesExecutive || 'N/A'}`);
      console.log('');
    }

    console.log('=' .repeat(70));
    console.log('🎉 SUCCESS! Created 3 professional quotations');
    console.log('=' .repeat(70));
    console.log('\n📋 Features included:');
    console.log('   ✅ Customer details (name, address, TRN, contact person)');
    console.log('   ✅ Professional fields (subject, sales executive, PO number)');
    console.log('   ✅ Detailed items (with weight, CBM, size)');
    console.log('   ✅ Services (installation, disassembly)');
    console.log('   ✅ Payment & delivery terms');
    console.log('\n🌐 View in admin panel:');
    console.log('   http://localhost:5174/quotes\n');
    console.log('📄 Test PDF generation by clicking "View" then "PDF" button!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding quotations:', error);
    process.exit(1);
  }
};

// Run the script
seedProfessionalQuotations();

