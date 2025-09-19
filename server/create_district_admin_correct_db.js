const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createDistrictAdminInCorrectDB() {
  try {
    // Connect to the CORRECT database that the server uses
    await mongoose.connect('mongodb://localhost:27017/civic-connect');
    console.log('✅ MongoDB connected to civic-connect database');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'dilshan@gmail.com' });
    if (existingUser) {
      console.log('📋 User already exists in civic-connect database:');
      console.log('   Email:', existingUser.email);
      console.log('   Role:', existingUser.role);
      console.log('   Hash:', existingUser.password);
      
      // Test current password
      const isMatch = await existingUser.comparePassword('123456');
      console.log('   Password "123456":', isMatch ? '✅ WORKS' : '❌ FAILED');
      
      if (isMatch) {
        console.log('🎉 District admin already exists and password works!');
        mongoose.disconnect();
        return;
      } else {
        console.log('🔄 Updating password to "123456"...');
        existingUser.password = '123456'; // Will be hashed by pre-save hook
        await existingUser.save();
        console.log('✅ Password updated successfully!');
        
        // Verify the update
        const updatedUser = await User.findOne({ email: 'dilshan@gmail.com' });
        const newMatch = await updatedUser.comparePassword('123456');
        console.log('✅ Password verification:', newMatch ? 'SUCCESS' : 'FAILED');
        
        mongoose.disconnect();
        return;
      }
    }
    
    // Create new district admin in civic-connect database
    console.log('🆕 Creating district admin in civic-connect database...');
    
    const districtAdmin = new User({
      name: 'Dilshan District Head',
      email: 'dilshan@gmail.com',
      password: '123456', // Will be hashed by the User model pre-save hook
      role: 'district_admin',
      adminRole: 'district_admin',
      district: 'Ranchi',
      isActive: true
    });
    
    await districtAdmin.save();
    console.log('✅ District admin created successfully in civic-connect database!');
    console.log('📧 Email: dilshan@gmail.com');
    console.log('🔑 Password: 123456');
    console.log('🏷️ Role: district_admin');
    console.log('📍 District: Ranchi');
    
    // Verify password works
    const savedUser = await User.findOne({ email: 'dilshan@gmail.com' });
    const isMatch = await savedUser.comparePassword('123456');
    console.log('✅ Password verification:', isMatch ? 'SUCCESS ✅' : 'FAILED ❌');
    
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
    mongoose.disconnect();
  }
}

createDistrictAdminInCorrectDB();