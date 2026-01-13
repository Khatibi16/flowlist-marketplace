const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testConnection() {
  console.log('\n🔍 Testing MongoDB Connection...\n');
  
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }
  
  // Hide password in logs
  const safeURI = mongoURI.replace(/\/\/.*@/, '//***:***@');
  console.log('📋 Connection String:', safeURI);
  console.log('');
  
  try {
    console.log('⏳ Attempting to connect...');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ SUCCESS! MongoDB Connected');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState} (1 = connected)\n`);
    
    // Test a simple query
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database\n`);
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error('Error Details:');
    console.error('  Message:', error.message);
    console.error('  Name:', error.name);
    
    if (error.message.includes('IP')) {
      console.error('\n💡 IP Whitelist Issue Detected!');
      console.error('   Your IP address is not whitelisted in MongoDB Atlas.');
      console.error('   Solutions:');
      console.error('   1. Go to MongoDB Atlas → Network Access');
      console.error('   2. Add your current IP address');
      console.error('   3. OR add 0.0.0.0/0 for development (allows all IPs)');
      console.error('   4. Wait 1-2 minutes for changes to take effect');
      console.error('   5. Restart your server');
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication Issue Detected!');
      console.error('   Check your username and password in the connection string.');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Connection Timeout!');
      console.error('   This could mean:');
      console.error('   - Your IP is not whitelisted');
      console.error('   - Network connectivity issues');
      console.error('   - MongoDB Atlas cluster is paused');
    }
    
    console.error('\n');
    process.exit(1);
  }
}

testConnection();

