// Test Yahya's authentication with different possible passwords
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const mongoURI = 'mongodb+srv://bharanidharank23cse_db_user:bharani5544@cluster0.rctom2c.mongodb.net/civic-connect?retryWrites=true&w=majority&appName=Cluster0';

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  municipality: String,
  ward: String,
  district: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function testYahyaAuth() {
  try {
    console.log('🔐 Testing Yahya authentication...\n');
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get Yahya's user record
    const yahya = await User.findOne({ email: 'yahya@gmail.com' });
    if (!yahya) {
      console.log('❌ Yahya user not found!');
      return;
    }
    
    console.log('👤 Yahya user found:');
    console.log(`   Name: ${yahya.name}`);
    console.log(`   Email: ${yahya.email}`);
    console.log(`   Role: ${yahya.role}`);
    console.log(`   Municipality: ${yahya.municipality}`);
    console.log(`   Ward: ${yahya.ward}`);
    console.log(`   Password hash: ${yahya.password.substring(0, 20)}...`);
    console.log(`   Password length: ${yahya.password.length}`);
    
    // Test common passwords
    const possiblePasswords = [
      'password123',
      '123456',
      'yahya123',
      'admin123',
      'password',
      '12345',
      'yahya'
    ];
    
    console.log('\n🧪 Testing possible passwords...');
    
    for (const password of possiblePasswords) {
      try {
        // Test if password is hashed (bcrypt)
        if (yahya.password.startsWith('$2')) {
          const isMatch = await bcrypt.compare(password, yahya.password);
          console.log(`   "${password}": ${isMatch ? '✅ MATCH!' : '❌ No match'}`);
          if (isMatch) {
            console.log(`\n🎉 Found matching password: "${password}"`);
            break;
          }
        } else {
          // Test plain text password
          const isMatch = password === yahya.password;
          console.log(`   "${password}": ${isMatch ? '✅ MATCH!' : '❌ No match'}`);
          if (isMatch) {
            console.log(`\n🎉 Found matching password: "${password}"`);
            break;
          }
        }
      } catch (error) {
        console.log(`   "${password}": ❌ Error testing - ${error.message}`);
      }
    }
    
    // Check if password looks like bcrypt hash
    if (yahya.password.startsWith('$2')) {
      console.log('\n💡 Password appears to be bcrypt hashed');
      console.log('   Hash format: $2b$...');
    } else {
      console.log('\n💡 Password appears to be plain text or different hash');
    }
    
    console.log('🔑 To fix authentication, you may need to:');
    console.log('   1. Update Yahya\'s password to a known value');
    console.log('   2. Or find the correct password');
    console.log('   3. Or reset the password in the database');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Disconnected from MongoDB');
  }
}

// Run the test
testYahyaAuth();