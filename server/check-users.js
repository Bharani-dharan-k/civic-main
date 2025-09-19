const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-connect', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const User = require('./models/User');

async function checkUsers() {
    try {
        console.log('🔍 Checking all users in database...\n');

        // Get all users
        const allUsers = await User.find({});

        console.log(`Found ${allUsers.length} total users in database:\n`);

        allUsers.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  ID: ${user._id}`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Department: ${user.department || 'Not set'}`);
            console.log(`  Municipality: ${user.municipality || 'Not set'}`);
            console.log(`  District: ${user.district || 'Not set'}`);
            console.log(`  Created: ${user.createdAt}`);
            console.log('  ---');
        });

        // Look for users with similar names
        console.log('\n🔍 Looking for department head users...');
        const departmentHeads = await User.find({ role: 'department_head' });
        console.log(`Found ${departmentHeads.length} department head users:`);
        
        departmentHeads.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.name} (${user.email}) - Dept: ${user.department || 'Not set'}`);
        });

        // Look for users with 'dharun' in name or email
        const dharunUsers = await User.find({
            $or: [
                { name: { $regex: 'dharun', $options: 'i' } },
                { email: { $regex: 'dharun', $options: 'i' } }
            ]
        });

        console.log(`\n🔍 Users with 'dharun' in name or email:`);
        console.log(`Found ${dharunUsers.length} matching users:`);
        
        dharunUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Dept: ${user.department || 'Not set'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();