const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app');
        
        console.log('=== CHECKING USERS ===');
        
        // Check for the specific email
        const dharunUser = await User.findOne({ email: 'dharaun@gmail.com' });
        console.log('\nDharun user found:', dharunUser ? {
            id: dharunUser._id.toString(),
            name: dharunUser.name,
            email: dharunUser.email,
            role: dharunUser.role,
            hasPassword: !!dharunUser.password,
            passwordLength: dharunUser.password ? dharunUser.password.length : 0
        } : 'NOT FOUND');
        
        // Check all department heads
        const departmentHeads = await User.find({ role: 'department_head' });
        console.log('\nDepartment Heads:', departmentHeads.map(u => ({ 
            id: u._id.toString(), 
            name: u.name, 
            email: u.email,
            role: u.role,
            hasPassword: !!u.password
        })));
        
        // Check all admin-type users
        const adminRoles = ['super_admin', 'district_admin', 'municipality_admin', 'department_head', 'field_head'];
        const allAdmins = await User.find({ role: { $in: adminRoles } });
        console.log('\nAll Admin Users:');
        allAdmins.forEach(u => {
            console.log(`  - ${u.name} (${u.email}) - Role: ${u.role} - Has Password: ${!!u.password}`);
        });
        
        mongoose.disconnect();
        console.log('\nDisconnected from database');
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();