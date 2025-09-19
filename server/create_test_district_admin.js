const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createTestDistrictAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sevatrack');
    console.log('MongoDB connected');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'dilshan@gmail.com' });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      mongoose.disconnect();
      return;
    }
    
    // Create district admin
    console.log('Creating district admin...');
    
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
    console.log('✅ District admin created successfully!');
    console.log('Email: dilshan@gmail.com');
    console.log('Password: 123456');
    console.log('District: Ranchi');
    
    // Verify password works
    const savedUser = await User.findOne({ email: 'dilshan@gmail.com' });
    const isMatch = await savedUser.comparePassword('123456');
    console.log('Password verification:', isMatch ? '✅ WORKS' : '❌ FAILED');
    
    mongoose.disconnect();
  } catch (err) {
    console.error('Error creating district admin:', err);
    mongoose.disconnect();
  }
}

createTestDistrictAdmin();