/**
 * Fix Customer Indexes Script
 * Drops old indexes and recreates proper ones
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

const fixIndexes = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get current indexes
    console.log('📊 Current indexes:');
    const indexes = await Customer.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));
    console.log('');

    // Drop all indexes except _id
    console.log('🗑️  Dropping old indexes...');
    await Customer.collection.dropIndexes();
    console.log('✅ Old indexes dropped\n');

    // Recreate indexes from schema
    console.log('🔄 Creating new indexes from schema...');
    await Customer.syncIndexes();
    console.log('✅ New indexes created\n');

    // Show new indexes
    console.log('📊 New indexes:');
    const newIndexes = await Customer.collection.getIndexes();
    console.log(JSON.stringify(newIndexes, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS! Customer indexes fixed');
    console.log('='.repeat(60));
    console.log('\n💡 You can now add customers without "customerCode" error!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

// Run the script
fixIndexes();

