require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing Atlas Database Connection...');
console.log('📍 Database URI:', process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//*****:*****@'));

async function testConnection() {
  try {
    console.log('\n⏳ Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Get database info
    const db = mongoose.connection.db;
    const admin = db.admin();
    const dbInfo = await admin.listDatabases();
    
    console.log('\n📊 Available Databases:');
    dbInfo.databases.forEach(database => {
      console.log(`   - ${database.name} (${(database.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Get current database name
    const currentDbName = db.databaseName;
    console.log(`\n🎯 Current Database: ${currentDbName}`);
    
    // List collections in current database
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Collections in ${currentDbName}:`);
    
    if (collections.length === 0) {
      console.log('   📝 No collections found (empty database)');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} documents`);
      }
    }
    
    // Test basic operations
    console.log('\n🧪 Testing Database Operations...');
    
    // Create a test collection and document
    const testCollection = db.collection('connection_test');
    const testDoc = {
      timestamp: new Date(),
      test: 'Atlas connection successful',
      project: 'civic-connect',
      atlas_cluster: 'cluster0.rctom2c.mongodb.net'
    };
    
    await testCollection.insertOne(testDoc);
    
    const retrievedDoc = await testCollection.findOne({ project: 'civic-connect' });
    console.log('✅ Write/Read test:', retrievedDoc ? 'PASSED' : 'FAILED');
    
    // Clean up test
    await testCollection.deleteOne({ project: 'civic-connect' });
    console.log('✅ Cleanup successful');
    
    console.log('\n🎉 Atlas Database is ready for use!');
    console.log(`🔗 Connected to: cluster0.rctom2c.mongodb.net`);
    console.log(`📦 Database: ${currentDbName}`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Fix: Check username/password in connection string');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Fix: Check internet connection and Atlas network access');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Fix: Check Atlas cluster status and IP whitelist');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testConnection();