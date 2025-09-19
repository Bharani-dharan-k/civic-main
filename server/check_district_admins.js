const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkDistrictAdmins() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sevatrack');
    console.log('MongoDB connected');
    
    // Find all district admins
    const districtAdmins = await User.find({ role: 'district_admin' });
    console.log(`\nFound ${districtAdmins.length} district admin(s):`);
    
    districtAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   District: ${admin.district}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log(`   Password Hash: ${admin.password.substring(0, 30)}...`);
      console.log('---');
    });
    
    // Test password for dilshan@gmail.com specifically
    const dilshanAdmin = await User.findOne({ email: 'dilshan@gmail.com' });
    if (dilshanAdmin) {
      console.log('\nTesting passwords for dilshan@gmail.com:');
      const testPasswords = ['123456', '12345', 'password', 'dilshan123', 'admin123', 'dilshan'];
      
      for (const testPwd of testPasswords) {
        try {
          const isMatch = await dilshanAdmin.comparePassword(testPwd);
          console.log(`Password '${testPwd}': ${isMatch ? 'MATCH ✅' : 'NO MATCH ❌'}`);
        } catch (err) {
          console.log(`Password '${testPwd}': ERROR - ${err.message}`);
        }
      }
    } else {
      console.log('\nNo user found with email dilshan@gmail.com');
    }
    
    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDistrictAdmins();