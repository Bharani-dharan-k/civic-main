require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('🔍 Debugging 500 Error Issues...');

// Import the actual User model
const User = require('./models/User');

async function debugAuthIssues() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    const problematicUsers = ['bhupesh@gmail.com', 'dharun@gmail.com', 'ashok@gmail.com'];
    
    for (const email of problematicUsers) {
      console.log(`\n🔍 Debugging: ${email}`);
      
      try {
        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
          console.log('   ❌ User not found in database');
          continue;
        }
        
        console.log('   ✅ User found in database');
        console.log('   📝 User details:', {
          name: user.name,
          email: user.email,
          role: user.role,
          hasPassword: !!user.password,
          passwordLength: user.password?.length || 0
        });
        
        // Test password comparison
        if (user.comparePassword) {
          console.log('   🔍 Testing comparePassword method...');
          const result = await user.comparePassword('123456');
          console.log('   🔐 comparePassword result:', result);
        } else {
          console.log('   ⚠️  comparePassword method not available');
        }
        
        // Test bcrypt directly
        console.log('   🔍 Testing bcrypt.compare directly...');
        const directResult = await bcrypt.compare('123456', user.password);
        console.log('   🔐 bcrypt.compare result:', directResult);
        
        // Check if password is properly hashed
        const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
        console.log('   🔐 Password is hashed:', isHashed);
        
        if (!isHashed) {
          console.log('   ⚠️  Password is not hashed! This could cause issues.');
        }
        
      } catch (userError) {
        console.log('   ❌ Error with user:', userError.message);
        console.log('   Stack:', userError.stack);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

debugAuthIssues();