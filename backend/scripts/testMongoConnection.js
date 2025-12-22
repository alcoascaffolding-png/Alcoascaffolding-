/**
 * Test MongoDB Atlas Connection
 * This script helps diagnose connection issues
 */

require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  console.log('🔍 Testing MongoDB Connection...\n');

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is not set in .env file');
    console.log('\n📝 Please add this to your backend/.env file:');
    console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  // Display connection string (masked password)
  const uri = process.env.MONGODB_URI;
  const maskedUri = uri.replace(/:([^:@]+)@/, ':***@');
  console.log('📋 Connection String (password hidden):');
  console.log(maskedUri);
  console.log('');

  // Parse connection string to check format
  try {
    const url = new URL(uri.replace('mongodb+srv://', 'https://'));
    const username = url.username;
    const host = url.hostname;
    const pathname = url.pathname;
    const database = pathname ? pathname.replace('/', '') : 'NO DATABASE NAME';

    console.log('📊 Connection Details:');
    console.log(`   Username: ${username || 'NOT SET'}`);
    console.log(`   Host: ${host || 'NOT SET'}`);
    console.log(`   Database: ${database || 'NOT SET'}`);
    console.log('');

    // Check for common issues
    if (uri.includes('<password>') || uri.includes('<db_password>')) {
      console.error('❌ ERROR: Password placeholder not replaced!');
      console.log('   Replace <password> or <db_password> with your actual password\n');
      process.exit(1);
    }

    if (database === 'NO DATABASE NAME' || database === '') {
      console.warn('⚠️  WARNING: No database name in connection string');
      console.log('   Add database name: mongodb+srv://...@cluster.mongodb.net/alcoa-admin?...\n');
    }

    // Check for special characters that might need encoding
    const passwordMatch = uri.match(/:\/([^@]+)@/);
    if (passwordMatch) {
      const password = passwordMatch[1];
      const specialChars = /[@#%&+=\s]/;
      if (specialChars.test(password)) {
        console.warn('⚠️  WARNING: Password contains special characters that may need URL encoding');
        console.log('   Special characters in passwords must be URL-encoded:');
        console.log('   @ → %40, # → %23, % → %25, & → %26, + → %2B, = → %3D, space → %20');
        console.log('   Use an online URL encoder: https://www.urlencoder.org/\n');
      }
    }

  } catch (error) {
    console.error('❌ ERROR: Invalid connection string format');
    console.log('   Expected format: mongodb+srv://username:password@cluster.mongodb.net/database-name?options\n');
    process.exit(1);
  }

  // Try to connect
  console.log('🔄 Attempting to connect...\n');

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });

    console.log('✅ SUCCESS! Connected to MongoDB Atlas');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ CONNECTION FAILED!\n');
    
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('🔐 Authentication Error:');
      console.log('   Possible causes:');
      console.log('   1. Wrong username or password');
      console.log('   2. Password contains special characters that need URL encoding');
      console.log('   3. User doesn\'t exist in MongoDB Atlas');
      console.log('\n   Solutions:');
      console.log('   → Go to MongoDB Atlas → Database Access → Verify username');
      console.log('   → Reset password if needed');
      console.log('   → URL encode special characters in password:');
      console.log('      @ → %40, # → %23, % → %25, & → %26, + → %2B, = → %3D');
      console.log('   → Use: https://www.urlencoder.org/ to encode your password\n');
    } else if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
      console.error('🌐 Network Error:');
      console.log('   Possible causes:');
      console.log('   1. Network Access not configured in MongoDB Atlas');
      console.log('   2. Firewall blocking connection');
      console.log('   3. Wrong cluster URL');
      console.log('\n   Solutions:');
      console.log('   → Go to MongoDB Atlas → Network Access');
      console.log('   → Add IP Address: 0.0.0.0/0 (for development)');
      console.log('   → Or add your current IP address\n');
    } else {
      console.error('❌ Error Details:');
      console.error(`   ${error.message}\n`);
    }

    process.exit(1);
  }
};

// Run the test
testConnection();

