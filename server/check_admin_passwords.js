require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    const admins = await User.find({ 
      role: { $in: ['super_admin', 'district_admin', 'municipality_admin', 'department_head'] }
    });
    
    console.log('\n=== Admin Users in Database ===');
    for (const admin of admins) {
      console.log(`Email: ${admin.email}`);
      console.log(`Name: ${admin.name}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Password Hash: ${admin.password}`);
      console.log(`Password length: ${admin.password?.length || 'undefined'}`);
      console.log(`Is hashed (starts with $2b$): ${admin.password?.startsWith('$2b$') || false}`);
      console.log('---');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmins();