const mongoose = require('mongoose');
const User = require('./models/User');

async function testLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sevatrack');
    console.log('✅ MongoDB connected');
    
    const email = 'dilshan@gmail.com';
    const password = '123456';
    
    // Find admin user in database
    const adminRoles = ['super_admin', 'district_admin', 'municipality_admin', 'department_head', 'field_head'];
    const dbAdmin = await User.findOne({ 
        email: email, 
        role: { $in: adminRoles } 
    });
    
    if (dbAdmin) {
        console.log('✅ Database admin found:', dbAdmin.email);
        console.log('📧 Email:', dbAdmin.email);
        console.log('👤 Name:', dbAdmin.name);  
        console.log('🏷️ Role:', dbAdmin.role);
        console.log('📍 District:', dbAdmin.district);
        console.log('🔐 Stored hash:', dbAdmin.password);
        console.log('📏 Hash length:', dbAdmin.password.length);
        
        console.log('\n🔐 Testing password...');
        console.log('Input password:', JSON.stringify(password));
        console.log('Password length:', password.length);
        console.log('Password type:', typeof password);
        
        // Check password using the User model method
        const isMatch = await dbAdmin.comparePassword(password);
        console.log('✅ Password match result:', isMatch);
        
        if (isMatch) {
            console.log('🎉 SUCCESS: Login should work!');
            
            // Simulate successful login response
            const loginResponse = {
                success: true,
                user: {
                    id: dbAdmin._id.toString(),
                    name: dbAdmin.name,
                    email: dbAdmin.email,
                    role: dbAdmin.role,
                    userType: 'admin'
                },
                message: `Welcome ${dbAdmin.role.replace('_', ' ')}!`
            };
            
            console.log('📝 Expected login response:', JSON.stringify(loginResponse, null, 2));
        } else {
            console.log('❌ FAILED: Password does not match');
            
            // Test a few other common passwords
            const testPasswords = ['password', 'dilshan123', 'admin123', '12345', 'dilshan'];
            console.log('\n🔍 Testing other common passwords...');
            
            for (const testPwd of testPasswords) {
                const testResult = await dbAdmin.comparePassword(testPwd);
                console.log(`Password '${testPwd}': ${testResult ? '✅ MATCH!' : '❌ No'}`);
                if (testResult) break;
            }
        }
    } else {
        console.log('❌ No database admin found with email:', email);
        
        // Check if user exists with any role
        const anyUser = await User.findOne({ email: email });
        if (anyUser) {
            console.log('📋 User exists but with role:', anyUser.role);
        } else {
            console.log('📋 No user found with this email at all');
        }
    }
    
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
    mongoose.disconnect();
  }
}

testLogin();