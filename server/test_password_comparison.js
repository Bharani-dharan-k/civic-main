require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testPasswordComparison() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    // Test with bhupesh@gmail.com
    const user = await User.findOne({ email: 'bhupesh@gmail.com' });
    
    if (user) {
      console.log(`\nTesting password for: ${user.email}`);
      console.log(`Stored hash: ${user.password}`);
      
      const testPassword = '123456';
      console.log(`Test password: "${testPassword}"`);
      console.log(`Password length: ${testPassword.length}`);
      
      // Test direct bcrypt comparison
      const directMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`Direct bcrypt.compare result: ${directMatch}`);
      
      // Test using the User model's comparePassword method
      if (user.comparePassword) {
        const modelMatch = await user.comparePassword(testPassword);
        console.log(`User.comparePassword result: ${modelMatch}`);
      } else {
        console.log('User.comparePassword method not available');
      }
      
      // Test with wrong password
      const wrongPassword = 'wrongpassword';
      const wrongMatch = await bcrypt.compare(wrongPassword, user.password);
      console.log(`Wrong password test: ${wrongMatch}`);
      
    } else {
      console.log('User bhupesh@gmail.com not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPasswordComparison();