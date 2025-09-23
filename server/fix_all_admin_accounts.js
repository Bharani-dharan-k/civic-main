require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('🔧 Fixing All Admin Account Issues...');

// Define User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'municipality_admin', 'district_admin', 'super_admin', 'department_admin', 'department_head', 'staff'],
    default: 'citizen'
  },
  district: { type: String },
  municipality: { type: String },
  ward: { type: String },
  department: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Add comparePassword method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function fixAdminAccounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to civic-connect database');
    
    // All admin accounts that should exist
    const adminAccounts = [
      {
        name: 'Super Admin',
        email: 'bharani@gmail.com',
        password: '123456', // Use 123456 as standard password
        role: 'super_admin',
        phone: '9876543210',
        district: 'Delhi',
        municipality: 'New Delhi Municipal Corporation'
      },
      {
        name: 'Dilshan District Admin',
        email: 'dilshan@gmail.com',
        password: '123456',
        role: 'district_admin',
        phone: '9876543211',
        district: 'Bokaro',
        municipality: 'Bokaro Steel City'
      },
      {
        name: 'Bhupesh Municipal Admin',
        email: 'bhupesh@gmail.com',
        password: '123456',
        role: 'municipality_admin',
        phone: '9876543212',
        district: 'Bokaro',
        municipality: 'Bokaro Municipality',
        ward: 'Ward 1'
      },
      {
        name: 'Dharun Department Admin',
        email: 'dharun@gmail.com',
        password: '123456',
        role: 'department_head', // Note: using department_head to match hardcoded credentials
        phone: '9876543213',
        district: 'Bokaro',
        municipality: 'Bokaro Municipality',
        department: 'Public Works'
      },
      {
        name: 'Admin Ashok',
        email: 'ashok@gmail.com',
        password: '123456',
        role: 'district_admin',
        phone: '9876543214',
        district: 'Bokaro',
        municipality: 'Bokaro Steel City'
      }
    ];
    
    console.log('\n🔄 Fixing admin accounts...');
    
    for (const adminData of adminAccounts) {
      try {
        console.log(`\n👤 Processing: ${adminData.email}`);
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: adminData.email });
        
        if (existingUser) {
          console.log(`   📝 User exists, updating password and details...`);
          
          // Update user with new password (will be auto-hashed by pre-save middleware)
          existingUser.name = adminData.name;
          existingUser.password = adminData.password;
          existingUser.role = adminData.role;
          existingUser.phone = adminData.phone;
          existingUser.district = adminData.district;
          existingUser.municipality = adminData.municipality;
          if (adminData.ward) existingUser.ward = adminData.ward;
          if (adminData.department) existingUser.department = adminData.department;
          
          await existingUser.save();
          console.log(`   ✅ Updated: ${adminData.email} (${adminData.role})`);
        } else {
          console.log(`   🆕 Creating new user...`);
          
          // Create new user
          const newUser = new User(adminData);
          await newUser.save();
          console.log(`   ✅ Created: ${adminData.email} (${adminData.role})`);
        }
        
        // Test the password
        const testUser = await User.findOne({ email: adminData.email });
        const passwordTest = await testUser.comparePassword('123456');
        console.log(`   🔐 Password test: ${passwordTest ? 'PASS' : 'FAIL'}`);
        
      } catch (error) {
        console.log(`   ❌ Error with ${adminData.email}:`, error.message);
      }
    }
    
    // Show final summary
    console.log('\n📊 Final Admin Account Summary:');
    const allAdmins = await User.find({ 
      role: { $in: ['super_admin', 'district_admin', 'municipality_admin', 'department_head', 'department_admin'] }
    }).select('name email role');
    
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} - ${admin.name} (${admin.role})`);
    });
    
    console.log('\n🎉 All admin accounts fixed!');
    console.log('\n🔑 Standard Login Credentials (all use password: 123456):');
    console.log('   Super Admin: bharani@gmail.com / 123456');
    console.log('   District Admin: dilshan@gmail.com / 123456');
    console.log('   Municipal Admin: bhupesh@gmail.com / 123456');
    console.log('   Department Head: dharun@gmail.com / 123456');
    console.log('   District Admin 2: ashok@gmail.com / 123456');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

fixAdminAccounts();