require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

console.log('🔍 Testing Admin Authentication Issues...');

async function testAdminAuth() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    // Check if bharani@gmail.com exists in database
    const User = require('./models/User');
    const dbAdmin = await User.findOne({ email: 'bharani@gmail.com' });
    
    if (dbAdmin) {
      console.log('📋 Database Admin Found:');
      console.log('   Email:', dbAdmin.email);
      console.log('   Role:', dbAdmin.role);
      console.log('   Password Hash:', dbAdmin.password);
      
      // Test password comparisons
      const passwords = ['123456', 'password'];
      
      for (const testPassword of passwords) {
        console.log(`\n🔑 Testing password: "${testPassword}"`);
        
        try {
          const isMatch = await bcrypt.compare(testPassword, dbAdmin.password);
          console.log(`   bcrypt.compare result: ${isMatch}`);
          
          if (dbAdmin.comparePassword) {
            const modelMatch = await dbAdmin.comparePassword(testPassword);
            console.log(`   model.comparePassword result: ${modelMatch}`);
          }
        } catch (error) {
          console.log(`   Error testing password: ${error.message}`);
        }
      }
    } else {
      console.log('❌ No database admin found with email bharani@gmail.com');
    }
    
    // Check the hardcoded admin credentials
    console.log('\n📋 Hardcoded Admin Credentials:');
    const ADMIN_CREDENTIALS = [
      {
        email: 'bharani@gmail.com',
        name: 'Admin Bharani',
        password: 'password', // This is the issue!
        role: 'super_admin'
      }
    ];
    
    const hardcodedAdmin = ADMIN_CREDENTIALS[0];
    console.log('   Email:', hardcodedAdmin.email);
    console.log('   Password:', hardcodedAdmin.password);
    console.log('   Role:', hardcodedAdmin.role);
    
    // Test if 'password' vs '123456' issue
    console.log('\n🧪 Testing Expected vs Actual Passwords:');
    console.log('   Expected: 123456');
    console.log('   Hardcoded: password');
    console.log('   ❌ This is the mismatch causing login failures!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testAdminAuth();