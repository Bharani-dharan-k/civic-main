const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function debugPasswordIssue() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sevatrack');
    console.log('MongoDB connected');
    
    // Find the user
    const user = await User.findOne({ email: 'dilshan@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      mongoose.disconnect();
      return;
    }
    
    console.log('✅ User found:');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('District:', user.district);
    console.log('Password Hash:', user.password);
    console.log('Hash length:', user.password.length);
    console.log('Hash starts with $2b$:', user.password.startsWith('$2b$'));
    
    // Test different passwords
    const testPasswords = ['123456', 'password', 'dilshan123', 'admin123'];
    
    console.log('\n🔐 Testing passwords:');
    for (const pwd of testPasswords) {
      try {
        // Test using User model method
        const modelResult = await user.comparePassword(pwd);
        
        // Test using bcrypt directly
        const directResult = await bcrypt.compare(pwd, user.password);
        
        console.log(`Password '${pwd}':`, {
          modelMethod: modelResult ? '✅ MATCH' : '❌ NO MATCH',
          directBcrypt: directResult ? '✅ MATCH' : '❌ NO MATCH'
        });
        
        if (modelResult) {
          console.log('🎉 FOUND WORKING PASSWORD:', pwd);
          break;
        }
      } catch (err) {
        console.log(`❌ Error testing '${pwd}':`, err.message);
      }
    }
    
    // Test manual hash creation for '123456'
    console.log('\n🔧 Testing manual hash for "123456":');
    const testSalt = await bcrypt.genSalt(10);
    const testHash = await bcrypt.hash('123456', testSalt);
    const testResult = await bcrypt.compare('123456', testHash);
    console.log('Manual hash test:', testResult ? '✅ WORKS' : '❌ FAILED');
    
    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    mongoose.disconnect();
  }
}

debugPasswordIssue();