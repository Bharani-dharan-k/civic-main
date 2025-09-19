const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAllDilshanUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sevatrack');
    console.log('MongoDB connected');
    
    // Find ALL users with dilshan@gmail.com email
    const allDilshanUsers = await User.find({ email: 'dilshan@gmail.com' });
    console.log(`\nFound ${allDilshanUsers.length} user(s) with email dilshan@gmail.com:`);
    
    allDilshanUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   District: ${user.district}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Password Hash: ${user.password}`);
      console.log(`   isActive: ${user.isActive}`);
    });
    
    // Test password for each user
    console.log('\n🔐 Testing password "123456" for each user:');
    for (let i = 0; i < allDilshanUsers.length; i++) {
      const user = allDilshanUsers[i];
      try {
        const isMatch = await user.comparePassword('123456');
        console.log(`User ${i + 1} (ID: ${user._id}): ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      } catch (err) {
        console.log(`User ${i + 1} (ID: ${user._id}): ❌ ERROR - ${err.message}`);
      }
    }
    
    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    mongoose.disconnect();
  }
}

checkAllDilshanUsers();