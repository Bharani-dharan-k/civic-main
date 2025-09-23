require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔧 Fixing CreatedBy Field for Admin Users...');

const User = require('./models/User');

async function fixCreatedByField() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    // Get a super admin to use as createdBy
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      console.log('❌ No super admin found to use as createdBy');
      return;
    }
    
    console.log(`📝 Using ${superAdmin.email} as createdBy for other admins`);
    
    // Fix users that need createdBy field
    const usersToFix = await User.find({ 
      role: { $in: ['municipality_admin', 'department_head'] },
      createdBy: { $exists: false }
    });
    
    console.log(`\n🔄 Found ${usersToFix.length} users to fix...\n`);
    
    for (const user of usersToFix) {
      console.log(`👤 Fixing: ${user.email} (${user.role})`);
      
      try {
        // Set createdBy to super admin
        user.createdBy = superAdmin._id;
        
        // Set adminRole to match role
        user.adminRole = user.role;
        
        // Ensure required fields are set
        if (!user.district) {
          user.district = 'Bokaro';
        }
        
        if (!user.municipality) {
          user.municipality = 'Bokaro Municipality';
        }
        
        if (!user.phone) {
          user.phone = '9876543210';
        }
        
        await user.save();
        console.log(`   ✅ Fixed: ${user.email}`);
        console.log(`   📝 createdBy: ${superAdmin.email}`);
        console.log(`   📝 adminRole: ${user.adminRole}`);
        
      } catch (error) {
        console.log(`   ❌ Error fixing ${user.email}:`, error.message);
        console.log(`   📋 Error details:`, error.errors);
      }
      console.log('');
    }
    
    console.log('🎉 CreatedBy fields fixed!');
    
    // Test the problematic users one more time
    console.log('\n🧪 Testing problematic users after fix...');
    const testUsers = ['bhupesh@gmail.com', 'dharun@gmail.com'];
    
    for (const email of testUsers) {
      const user = await User.findOne({ email });
      if (user) {
        console.log(`✅ ${email}: Found, role=${user.role}, adminRole=${user.adminRole}, createdBy=${!!user.createdBy}`);
      } else {
        console.log(`❌ ${email}: Not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

fixCreatedByField();