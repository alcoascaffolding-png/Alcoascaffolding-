/**
 * Database Initialization Script
 * Creates admin user and sample data so database appears in MongoDB Atlas
 * Run: node scripts/initializeDatabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

const initializeDatabase = async () => {
  try {
    console.log('🚀 Starting Database Initialization...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ ERROR: MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to MongoDB Atlas`);
    console.log(`📊 Database: ${dbName}\n`);
    console.log('='.repeat(60));

    // Get database stats
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`\n📦 Existing Collections: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log('');

    // ============================================
    // 1. CREATE ADMIN USER
    // ============================================
    console.log('👤 Step 1: Creating Admin User...');
    const existingAdmin = await User.findOne({ email: 'admin@alcoa.com' });
    
    if (existingAdmin) {
      console.log('   ℹ️  Admin user already exists');
      console.log(`   📧 Email: ${existingAdmin.email}`);
      console.log(`   🔑 Role: ${existingAdmin.role}\n`);
    } else {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@alcoa.com',
        password: 'admin123', // Will be hashed by pre-save middleware
        role: 'super_admin',
        isActive: true,
        permissions: ['all'],
        department: 'management'
      });

      await adminUser.save();
      console.log('   ✅ Admin user created successfully!');
      console.log('   📧 Email: admin@alcoa.com');
      console.log('   🔑 Password: admin123');
      console.log('   ⚠️  IMPORTANT: Change password after first login!\n');
    }

    // ============================================
    // 2. CREATE SAMPLE CUSTOMERS
    // ============================================
    console.log('🏢 Step 2: Creating Sample Customers...');
    const customerCount = await Customer.countDocuments();
    
    if (customerCount >= 5) {
      console.log(`   ℹ️  Already have ${customerCount} customers\n`);
    } else {
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
          contactPersons: [{
            name: 'Ahmed Ali',
            designation: 'Project Manager',
            email: 'ahmed@emiratesconstruction.ae',
            phone: '+971501234567',
            whatsapp: '+971501234567',
            isPrimary: true,
            role: 'primary'
          }],
          addresses: [{
            type: 'office',
            addressLine1: 'Building 123, Office 456',
            area: 'Business Bay',
            city: 'Dubai',
            emirate: 'Dubai',
            isPrimary: true
          }]
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
          contactPersons: [{
            name: 'Mohammed Hassan',
            designation: 'Operations Manager',
            email: 'mohammed@sharjahfm.ae',
            phone: '+971502345678',
            isPrimary: true,
            role: 'primary'
          }],
          addresses: [{
            type: 'office',
            addressLine1: 'Al Nahda Road',
            city: 'Sharjah',
            emirate: 'Sharjah',
            isPrimary: true
          }]
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
          contactPersons: [{
            name: 'Khalid Ibrahim',
            email: 'khalid@adcontractors.ae',
            phone: '+971503456789',
            isPrimary: true,
            role: 'primary'
          }],
          addresses: [{
            type: 'office',
            addressLine1: 'Mussafah Industrial Area',
            city: 'Abu Dhabi',
            emirate: 'Abu Dhabi',
            isPrimary: true
          }]
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
          contactPersons: [{
            name: 'Salem Ahmad',
            email: 'salem@ajmandev.ae',
            phone: '+971504567890',
            isPrimary: true,
            role: 'primary'
          }],
          addresses: [{
            type: 'office',
            city: 'Ajman',
            emirate: 'Ajman',
            addressLine1: 'Al Rashidiya',
            isPrimary: true
          }]
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
          contactPersons: [{
            name: 'Rashid Khalil',
            email: 'rashid@rakind.ae',
            phone: '+971505678901',
            isPrimary: true,
            role: 'primary'
          }],
          addresses: [{
            type: 'office',
            city: 'Ras Al Khaimah',
            emirate: 'Ras Al Khaimah',
            addressLine1: 'Industrial Zone',
            isPrimary: true
          }]
        }
      ];

      for (const data of customersData) {
        const existing = await Customer.findOne({ companyName: data.companyName });
        if (!existing) {
          const customer = new Customer(data);
          await customer.save();
          console.log(`   ✅ Created: ${customer.companyName}`);
        }
      }
      console.log('');
    }

    // ============================================
    // 3. CREATE SAMPLE PRODUCTS
    // ============================================
    console.log('📦 Step 3: Creating Sample Products...');
    const productCount = await Product.countDocuments();
    
    if (productCount >= 5) {
      console.log(`   ℹ️  Already have ${productCount} products\n`);
    } else {
      const productsData = [
        {
          itemCode: 'SCF-001',
          itemName: 'Aluminium Scaffolding Frame 1.5m',
          description: 'Standard aluminium scaffolding frame, 1.5 meters height',
          category: 'scaffolding',
          subcategory: 'frames',
          primaryUnit: 'pcs',
          purchasePrice: 150,
          sellingPrice: 200,
          mrp: 250,
          taxRate: 5,
          currentStock: 100,
          minStockLevel: 20,
          reorderLevel: 30,
          isActive: true,
          isTrackInventory: true
        },
        {
          itemCode: 'SCF-002',
          itemName: 'Aluminium Scaffolding Frame 2.0m',
          description: 'Standard aluminium scaffolding frame, 2.0 meters height',
          category: 'scaffolding',
          subcategory: 'frames',
          primaryUnit: 'pcs',
          purchasePrice: 180,
          sellingPrice: 240,
          mrp: 300,
          taxRate: 5,
          currentStock: 80,
          minStockLevel: 20,
          reorderLevel: 30,
          isActive: true,
          isTrackInventory: true
        },
        {
          itemCode: 'LAD-001',
          itemName: 'Aluminium Extension Ladder 3m',
          description: 'Lightweight aluminium extension ladder, 3 meters',
          category: 'ladders',
          subcategory: 'extension',
          primaryUnit: 'pcs',
          purchasePrice: 300,
          sellingPrice: 450,
          mrp: 550,
          taxRate: 5,
          currentStock: 50,
          minStockLevel: 10,
          reorderLevel: 15,
          isActive: true,
          isTrackInventory: true
        },
        {
          itemCode: 'SAF-001',
          itemName: 'Safety Harness',
          description: 'Full body safety harness for construction workers',
          category: 'safety_equipment',
          subcategory: 'harnesses',
          primaryUnit: 'pcs',
          purchasePrice: 120,
          sellingPrice: 180,
          mrp: 220,
          taxRate: 5,
          currentStock: 75,
          minStockLevel: 15,
          reorderLevel: 20,
          isActive: true,
          isTrackInventory: true
        },
        {
          itemCode: 'ACC-001',
          itemName: 'Scaffolding Base Plate',
          description: 'Adjustable base plate for scaffolding stability',
          category: 'accessories',
          subcategory: 'base_plates',
          primaryUnit: 'pcs',
          purchasePrice: 25,
          sellingPrice: 40,
          mrp: 50,
          taxRate: 5,
          currentStock: 200,
          minStockLevel: 50,
          reorderLevel: 75,
          isActive: true,
          isTrackInventory: true
        }
      ];

      for (const data of productsData) {
        const existing = await Product.findOne({ itemCode: data.itemCode });
        if (!existing) {
          const product = new Product(data);
          await product.save();
          console.log(`   ✅ Created: ${product.itemName} (${product.itemCode})`);
        }
      }
      console.log('');
    }

    // ============================================
    // 4. CREATE SAMPLE VENDORS
    // ============================================
    console.log('🏭 Step 4: Creating Sample Vendors...');
    const vendorCount = await Vendor.countDocuments();
    
    if (vendorCount >= 3) {
      console.log(`   ℹ️  Already have ${vendorCount} vendors\n`);
    } else {
      const vendorsData = [
        {
          vendorCode: 'VND00001',
          companyName: 'Aluminium Suppliers UAE',
          vendorType: 'distributor',
          contactPerson: 'Omar Al Mansoori',
          email: 'sales@aluminiumsuppliers.ae',
          phone: '+971600123456',
          mobile: '+971600123456',
          status: 'active',
          paymentTerms: 'Net 30',
          rating: 4,
          billingAddress: {
            street: 'Industrial Area 15',
            city: 'Dubai',
            state: 'Dubai',
            country: 'UAE'
          },
          shippingAddress: {
            street: 'Industrial Area 15',
            city: 'Dubai',
            state: 'Dubai',
            country: 'UAE'
          }
        },
        {
          vendorCode: 'VND00002',
          companyName: 'Safety Equipment Co.',
          vendorType: 'distributor',
          contactPerson: 'Fatima Al Zaabi',
          email: 'orders@safetyequip.ae',
          phone: '+971600234567',
          mobile: '+971600234567',
          status: 'active',
          paymentTerms: 'Net 15',
          rating: 5,
          billingAddress: {
            street: 'Warehouse Complex',
            city: 'Sharjah',
            state: 'Sharjah',
            country: 'UAE'
          },
          shippingAddress: {
            street: 'Warehouse Complex',
            city: 'Sharjah',
            state: 'Sharjah',
            country: 'UAE'
          }
        },
        {
          vendorCode: 'VND00003',
          companyName: 'Scaffolding Parts Direct',
          vendorType: 'manufacturer',
          contactPerson: 'Youssef Al Hamadi',
          email: 'info@scaffparts.ae',
          phone: '+971600345678',
          mobile: '+971600345678',
          status: 'active',
          paymentTerms: 'Net 30',
          rating: 4,
          billingAddress: {
            street: 'Manufacturing Zone',
            city: 'Abu Dhabi',
            state: 'Abu Dhabi',
            country: 'UAE'
          },
          shippingAddress: {
            street: 'Manufacturing Zone',
            city: 'Abu Dhabi',
            state: 'Abu Dhabi',
            country: 'UAE'
          }
        }
      ];

      for (const data of vendorsData) {
        const existing = await Vendor.findOne({ companyName: data.companyName });
        if (!existing) {
          const vendor = new Vendor(data);
          await vendor.save();
          console.log(`   ✅ Created: ${vendor.companyName}`);
        }
      }
      console.log('');
    }

    // ============================================
    // 5. DATABASE STATISTICS
    // ============================================
    console.log('📊 Step 5: Database Statistics');
    console.log('='.repeat(60));
    
    const stats = {
      users: await User.countDocuments(),
      customers: await Customer.countDocuments(),
      products: await Product.countDocuments(),
      vendors: await Vendor.countDocuments(),
    };

    console.log('\n📈 Collection Counts:');
    console.log(`   👤 Users: ${stats.users}`);
    console.log(`   🏢 Customers: ${stats.customers}`);
    console.log(`   📦 Products: ${stats.products}`);
    console.log(`   🏭 Vendors: ${stats.vendors}`);
    console.log('');

    // Get all collections
    const allCollections = await db.listCollections().toArray();
    console.log(`📦 Total Collections: ${allCollections.length}`);
    for (const col of allCollections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   - ${col.name}: ${count} documents`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE INITIALIZATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 Database: ${dbName}`);
    console.log(`🌐 View in MongoDB Atlas:`);
    console.log(`   https://cloud.mongodb.com/`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Go to MongoDB Atlas Dashboard`);
    console.log(`   2. Click on "Browse Collections"`);
    console.log(`   3. Select database: ${dbName}`);
    console.log(`   4. You should see all collections with data!`);
    console.log(`\n🔐 Admin Login:`);
    console.log(`   Email: admin@alcoa.com`);
    console.log(`   Password: admin123`);
    console.log(`   ⚠️  Change password after first login!\n`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error initializing database:', error);
    if (error.message) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
};

// Run the script
initializeDatabase();

