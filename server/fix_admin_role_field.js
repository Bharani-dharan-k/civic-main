require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔧 Fixing Admin Role Field Issues...');

const User = require('./models/User');

async function fixAdminRoleField() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    const adminUsers = await User.find({ 
      role: { $in: ['super_admin', 'district_admin', 'municipality_admin', 'department_head'] }
    });
    
    console.log(`\n🔄 Found ${adminUsers.length} admin users to fix...\n`);
    
    for (const user of adminUsers) {
      console.log(`👤 Fixing: ${user.email} (${user.role})`);
      
      try {
        // Set adminRole to match role
        user.adminRole = user.role;
        
        // Ensure required fields are set
        if (!user.district && ['district_admin', 'municipality_admin', 'department_head'].includes(user.role)) {
          user.district = 'Bokaro'; // Default district
        }
        
        if (!user.municipality && ['municipality_admin', 'department_head'].includes(user.role)) {
          user.municipality = 'Bokaro Municipality'; // Default municipality
        }
        
        if (!user.phone) {
          user.phone = '9876543210'; // Default phone
        }
        
        await user.save();
        console.log(`   ✅ Fixed: ${user.email}`);
        console.log(`   📝 adminRole: ${user.adminRole}`);
        console.log(`   📝 district: ${user.district}`);
        console.log(`   📝 municipality: ${user.municipality}`);
        
      } catch (error) {
        console.log(`   ❌ Error fixing ${user.email}:`, error.message);
      }
      console.log('');
    }
    
    console.log('🎉 Admin role fields fixed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

fixAdminRoleField();