const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function validateAndFixAllDistrictAdmins() {
  try {
    // Connect to the correct database (civic-connect)
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/civic-connect';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected to:', mongoUri);
    
    // Find all district admin users
    const districtAdmins = await User.find({ role: 'district_admin' });
    console.log(`\n📊 Found ${districtAdmins.length} district admin(s)`);
    
    if (districtAdmins.length === 0) {
      console.log('📝 No district admins found. Creating sample accounts...');
      await createSampleDistrictAdmins();
      mongoose.disconnect();
      return;
    }
    
    console.log('\n🔍 Checking each district admin account:\n');
    
    const testPasswords = ['123456', 'password', 'admin123'];
    const results = [];
    
    for (let i = 0; i < districtAdmins.length; i++) {
      const admin = districtAdmins[i];
      console.log(`${i + 1}. 📧 Email: ${admin.email}`);
      console.log(`   👤 Name: ${admin.name}`);
      console.log(`   📍 District: ${admin.district || 'Not specified'}`);
      console.log(`   📅 Created: ${admin.createdAt}`);
      console.log(`   ✅ Active: ${admin.isActive}`);
      
      // Test common passwords
      let workingPassword = null;
      for (const testPwd of testPasswords) {
        try {
          const isMatch = await admin.comparePassword(testPwd);
          if (isMatch) {
            workingPassword = testPwd;
            console.log(`   🔑 Password "${testPwd}": ✅ WORKS`);
            break;
          } else {
            console.log(`   🔑 Password "${testPwd}": ❌ Failed`);
          }
        } catch (err) {
          console.log(`   🔑 Password "${testPwd}": ❌ Error - ${err.message}`);
        }
      }
      
      if (!workingPassword) {
        console.log(`   🔄 No working password found. Setting to "123456"...`);
        try {
          admin.password = '123456'; // Will be hashed by pre-save hook
          await admin.save();
          
          // Verify the fix
          const updatedAdmin = await User.findById(admin._id);
          const newMatch = await updatedAdmin.comparePassword('123456');
          if (newMatch) {
            console.log(`   ✅ Password reset successful! Use "123456"`);
            workingPassword = '123456';
          } else {
            console.log(`   ❌ Password reset failed!`);
          }
        } catch (err) {
          console.log(`   ❌ Error resetting password: ${err.message}`);
        }
      }
      
      results.push({
        email: admin.email,
        name: admin.name,
        district: admin.district,
        workingPassword: workingPassword,
        status: workingPassword ? 'OK' : 'FAILED'
      });
      
      console.log('   ' + '─'.repeat(50));
    }
    
    // Summary
    console.log('\n📋 SUMMARY - District Admin Login Credentials:\n');
    console.log('Email'.padEnd(25) + 'District'.padEnd(15) + 'Password'.padEnd(12) + 'Status');
    console.log('─'.repeat(70));
    
    results.forEach(result => {
      const status = result.status === 'OK' ? '✅ Ready' : '❌ Failed';
      console.log(
        result.email.padEnd(25) + 
        (result.district || 'N/A').padEnd(15) + 
        (result.workingPassword || 'NONE').padEnd(12) + 
        status
      );
    });
    
    const workingCount = results.filter(r => r.status === 'OK').length;
    console.log('\n📊 Results:');
    console.log(`✅ Working accounts: ${workingCount}/${results.length}`);
    console.log(`❌ Failed accounts: ${results.length - workingCount}/${results.length}`);
    
    mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    
  } catch (err) {
    console.error('❌ Error:', err);
    mongoose.disconnect();
  }
}

async function createSampleDistrictAdmins() {
  console.log('Creating sample district admin accounts...\n');
  
  const sampleDistricts = [
    { district: 'Ranchi', email: 'ranchi.admin@civic.gov.in' },
    { district: 'Dhanbad', email: 'dhanbad.admin@civic.gov.in' },
    { district: 'Jamshedpur', email: 'jamshedpur.admin@civic.gov.in' },
    { district: 'Bokaro', email: 'bokaro.admin@civic.gov.in' },
    { district: 'Deoghar', email: 'deoghar.admin@civic.gov.in' }
  ];
  
  for (const sample of sampleDistricts) {
    try {
      // Check if already exists
      const existing = await User.findOne({ email: sample.email });
      if (existing) {
        console.log(`⏭️  Skipping ${sample.email} - already exists`);
        continue;
      }
      
      const districtAdmin = new User({
        name: `${sample.district} District Head`,
        email: sample.email,
        password: '123456', // Will be hashed by pre-save hook
        role: 'district_admin',
        adminRole: 'district_admin',
        district: sample.district,
        isActive: true
      });
      
      await districtAdmin.save();
      console.log(`✅ Created: ${sample.email} - District: ${sample.district}`);
      
    } catch (err) {
      console.log(`❌ Failed to create ${sample.email}: ${err.message}`);
    }
  }
}

// Run the validation
validateAndFixAllDistrictAdmins();