/**
 * Create Quotation for Premier Class Building Contracting
 * Script to add quotation with all products from the screenshot
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Customer = require('../models/Customer');
const Quotation = require('../models/Quotation');
const User = require('../models/User');
const Product = require('../models/Product');

const createPremierClassQuotation = async () => {
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

    // Find the customer
    const customer = await Customer.findOne({
      companyName: 'Premier Class Building Contracting'
    });

    if (!customer) {
      console.error('❌ Customer "Premier Class Building Contracting" not found!');
      console.log('💡 Please run: node scripts/addPremierClassCustomer.js first');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ Found customer: ${customer.companyName}`);
    console.log(`   Customer ID: ${customer._id}\n`);

    // Find or get admin user for createdBy
    let adminUser = await User.findOne({ 
      $or: [
        { email: 'admin@alcoa.com' },
        { role: 'admin' },
        { role: 'super_admin' }
      ]
    });

    if (!adminUser) {
      // Try to find any user
      adminUser = await User.findOne();
      if (!adminUser) {
        console.error('❌ No user found in database!');
        console.log('💡 Please run: node scripts/createAdmin.js first');
        await mongoose.disconnect();
        process.exit(1);
      }
    }

    console.log(`✅ Using user: ${adminUser.email} (${adminUser.role}) for createdBy\n`);

    // Check if quotation already exists
    const existingQuote = await Quotation.findOne({
      customer: customer._id,
      'items.equipmentType': 'Cuplock scaffolding material for one month'
    });

    if (existingQuote) {
      console.log('ℹ️  Quotation already exists:');
      console.log(`   Quote Number: ${existingQuote.quoteNumber}`);
      console.log(`   Quote ID: ${existingQuote._id}`);
      console.log(`   Total: AED ${existingQuote.total.toFixed(2)}\n`);
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('🔄 Creating quotation with items...\n');

    // Helper function to check if image exists and return just the filename
    // Store only filename to avoid MongoDB 16MB document size limit
    const checkImageExists = (imageFileName) => {
      try {
        // Try multiple possible paths for backend assets
        const possiblePaths = [
          path.join(__dirname, '../backend/assets', imageFileName),
          path.join(__dirname, '../../backend/assets', imageFileName),
          path.join(__dirname, '../assets', imageFileName),
          path.join(__dirname, '..', 'backend', 'assets', imageFileName)
        ];
        
        for (const testPath of possiblePaths) {
          if (fs.existsSync(testPath)) {
            // Return just the filename - PDF generator will load it from assets folder
            return imageFileName;
          }
        }
        
        console.warn(`   ⚠️  Image not found: ${imageFileName}`);
        return '';
      } catch (error) {
        console.warn(`   ⚠️  Error checking image ${imageFileName}:`, error.message);
        return '';
      }
    };

    // Direct image mapping based on equipment types and available assets in backend/assets/
    // Using the scaffolding image (73-121-1659x2048.png) for all products as default
    // Store only filename to avoid MongoDB 16MB document size limit
    const defaultImageName = checkImageExists('73-121-1659x2048.png');
    
    const imageMapping = {
      'steel cuplock standard 3mtr': defaultImageName,
      'standard 2.5mtr': defaultImageName,
      'adjustable base plate': defaultImageName,
      'ledger 2.5mtr': defaultImageName,
      'ledger 1.8mtr': defaultImageName,
      'ledger1.2mtr': defaultImageName,
      'spigot connector': defaultImageName,
      'gi tube 6mtr': defaultImageName,
      'gi tube 3mtr': defaultImageName,
      'sleeve coupler': defaultImageName,
      'sleeves coupler': defaultImageName,
      'base plate': defaultImageName,
      'jointer pin': defaultImageName,
      'brc': defaultImageName,
      'ladder clamp': defaultImageName,
      'steel ladder 3mtr': defaultImageName,
      'single coupler': defaultImageName,
      'cuplock scaffolding material': defaultImageName,
      'transportation': defaultImageName
    };
    
    if (defaultImageName) {
      console.log(`   ✅ Found image file: ${defaultImageName}`);
      console.log(`   📝 Storing filename only (to avoid MongoDB size limit)`);
    } else {
      console.warn(`   ⚠️  Image file not found in backend/assets/`);
    }

    // Load products and create image mapping (fallback to product images if available)
    console.log('📦 Loading products to match images...');
    const products = await Product.find({ isActive: true });
    const productImageMap = {};
    
    products.forEach(product => {
      if (product.images && product.images.length > 0) {
        const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
        if (primaryImage && primaryImage.url) {
          const itemName = product.itemName.toLowerCase().trim();
          productImageMap[itemName] = primaryImage.url;
        }
      }
    });
    
    console.log(`   Found ${Object.keys(productImageMap).length} products with images in database`);
    console.log(`   Using ${Object.keys(imageMapping).length} direct image mappings\n`);

    // Helper function to find product image by equipment type
    const getProductImage = (equipmentType) => {
      if (!equipmentType) return '';
      
      const searchTerm = equipmentType.toLowerCase().trim();
      
      // First try direct mapping
      if (imageMapping[searchTerm]) {
        return imageMapping[searchTerm];
      }
      
      // Try partial match in direct mapping
      for (const [key, imageUrl] of Object.entries(imageMapping)) {
        if (searchTerm.includes(key) || key.includes(searchTerm)) {
          return imageUrl;
        }
      }
      
      // Fallback to product database images
      if (productImageMap[searchTerm]) {
        return productImageMap[searchTerm];
      }
      
      // Try partial matching with product names
      for (const [productName, imageUrl] of Object.entries(productImageMap)) {
        if (searchTerm.includes(productName) || productName.includes(searchTerm)) {
          return imageUrl;
        }
        
        // Try matching key words
        const searchWords = searchTerm.split(/\s+/);
        const productWords = productName.split(/\s+/);
        const matchingWords = searchWords.filter(word => 
          productWords.some(pWord => pWord.includes(word) || word.includes(pWord))
        );
        
        if (matchingWords.length >= 2 && matchingWords.length >= searchWords.length * 0.5) {
          return imageUrl;
        }
      }
      
      return '';
    };

    // Calculate valid until date (1 week from now)
    const quoteDate = new Date();
    const validUntil = new Date(quoteDate);
    validUntil.setDate(validUntil.getDate() + 7);

    // Items from the screenshot
    // For Quotation model, items need: equipmentType, quantity, ratePerUnit, subtotal, taxableAmount, vatPercentage, vatAmount
    const items = [
      {
        equipmentType: 'Steel Cuplock standard 3mtr',
        quantity: 60,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Steel Cuplock standard 3mtr')
      },
      {
        equipmentType: 'Standard 2.5mtr',
        quantity: 12,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Standard 2.5mtr')
      },
      {
        equipmentType: 'Adjustable Base plate',
        quantity: 12,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Adjustable Base plate')
      },
      {
        equipmentType: 'Ledger 2.5mtr',
        quantity: 95,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Ledger 2.5mtr')
      },
      {
        equipmentType: 'Spigot connector',
        quantity: 60,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Spigot connector')
      },
      {
        equipmentType: 'Gi tube 6mtr',
        quantity: 4,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Gi tube 6mtr')
      },
      {
        equipmentType: 'Gi tube 3mtr',
        quantity: 45,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Gi tube 3mtr')
      },
      {
        equipmentType: 'Sleeve coupler',
        quantity: 180,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Standard 2.5mtr')
      },
      {
        equipmentType: 'Standard 2.5mtr',
        quantity: 672,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Standard 2.5mtr')
      },
      {
        equipmentType: 'Base plate',
        quantity: 96,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Base plate')
      },
      {
        equipmentType: 'Ledger 1.8mtr',
        quantity: 1942,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Ledger 1.8mtr')
      },
      {
        equipmentType: 'Ledger1.2mtr',
        quantity: 450,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Ledger 1.2mtr')
      },
      {
        equipmentType: 'Jointer pin',
        quantity: 770,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Jointer pin')
      },
      {
        equipmentType: 'Gi tube 6mtr',
        quantity: 50,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Gi tube 6mtr')
      },
      {
        equipmentType: 'Sleeves coupler',
        quantity: 150,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Sleeves coupler')
      },
      {
        equipmentType: 'Brc',
        quantity: 1000,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Brc')
      },
      {
        equipmentType: 'Ladder clamp',
        quantity: 36,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Ladder clamp')
      },
      {
        equipmentType: 'Steel ladder 3mtr',
        quantity: 9,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Steel ladder 3mtr')
      },
      {
        equipmentType: 'Single coupler',
        quantity: 25,
        unit: 'Nos',
        ratePerUnit: 0,
        subtotal: 0,
        taxableAmount: 0,
        vatPercentage: 5,
        vatAmount: 0,
        itemImage: getProductImage('Single coupler')
      },
      {
        equipmentType: 'Cuplock scaffolding material for one month',
        quantity: 1,
        unit: 'Nos',
        ratePerUnit: 55000,
        subtotal: 55000,
        taxableAmount: 55000,
        vatPercentage: 5,
        vatAmount: 2750,
        itemImage: getProductImage('Cuplock scaffolding material')
      },
      {
        equipmentType: 'transportation',
        quantity: 1,
        unit: 'Nos',
        ratePerUnit: 2000,
        subtotal: 2000,
        taxableAmount: 2000,
        vatPercentage: 5,
        vatAmount: 100,
        itemImage: getProductImage('transportation')
      }
    ];

    // Count items with images
    const itemsWithImages = items.filter(item => item.itemImage).length;
    console.log(`   ✅ ${itemsWithImages} out of ${items.length} items matched with product images\n`);

    // Generate quote number
    const quoteNumber = await Quotation.generateQuoteNumber();

    // Create quotation data
    const quotationData = {
      quoteNumber: quoteNumber,
      customer: customer._id,
      customerName: customer.companyName,
      customerEmail: customer.primaryEmail || '',
      customerPhone: customer.primaryPhone || '',
      quoteDate: quoteDate,
      validUntil: validUntil,
      items: items,
      subtotal: 57000, // Will be recalculated by pre-save hook
      vatPercentage: 5,
      vatAmount: 2850, // Will be recalculated by pre-save hook
      totalAmount: 59850, // Will be recalculated by pre-save hook
      status: 'draft',
      quoteType: 'rental',
      paymentTerms: 'CDC/Cash',
      termsAndConditions: 'Current Dated Cheque / Cash with confirmation of order\nThe Validity of the Quotation is 1 week from the date of Quotation\nDelivery: 1 day from the date of confirmed order.\nTower assembly not included.\nTest certificates will be provided',
      notes: 'Quotation created from screenshot - Cuplock scaffolding material rental for one month',
      createdBy: adminUser._id
    };

    // Create quotation
    const quotation = new Quotation(quotationData);
    await quotation.save();

    console.log('✅ Successfully created quotation:');
    console.log('='.repeat(60));
    console.log(`   Quote Number: ${quotation.quoteNumber}`);
    console.log(`   Customer: ${quotation.customerName}`);
    console.log(`   Quote Date: ${quotation.quoteDate.toLocaleDateString()}`);
    console.log(`   Valid Until: ${quotation.validUntil.toLocaleDateString()}`);
    console.log(`   Items Count: ${quotation.items.length}`);
    console.log(`   Subtotal: AED ${quotation.subtotal.toFixed(2)}`);
    console.log(`   VAT (5%): AED ${quotation.vatAmount.toFixed(2)}`);
    console.log(`   Total: AED ${quotation.totalAmount.toFixed(2)}`);
    console.log(`   Status: ${quotation.status}`);
    console.log(`   Payment Terms: ${quotation.paymentTerms}`);
    console.log(`   Quote ID: ${quotation._id}`);
    console.log('='.repeat(60));
    console.log('\n📋 Items Summary:');
    console.log(`   - ${quotation.items.length} items total`);
    console.log(`   - ${quotation.items.filter(i => i.ratePerUnit > 0).length} items with pricing`);
    console.log(`   - ${quotation.items.filter(i => i.ratePerUnit === 0).length} items with zero price`);
    console.log('\n🌐 View in admin panel:');
    console.log(`   http://localhost:5174/quotes/${quotation._id}\n`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating quotation:', error);
    if (error.code === 11000) {
      console.error('   Duplicate entry detected. Quotation may already exist.');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
createPremierClassQuotation();

