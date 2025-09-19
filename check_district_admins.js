const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./server/models/User');

// Connect to MongoDB
async function checkDistrictAdmins() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/civic-management';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        console.log('🔍 Checking District Admins in Database...\n');
        
        // Find all admin users
        const adminUsers = await User.find({ 
            role: { $in: ['admin', 'district_admin', 'super_admin'] }
        }).select('name email role district municipality isActive');
        
        console.log(`Found ${adminUsers.length} admin users:`);
        adminUsers.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.name || 'No Name'}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   District: ${admin.district || 'Not Set'}`);
            console.log(`   Municipality: ${admin.municipality || 'Not Set'}`);
            console.log(`   Active: ${admin.isActive}`);
            console.log('');
        });
        
        // Also check if there are any users with district field
        const usersWithDistrict = await User.find({ 
            district: { $exists: true, $ne: null, $ne: '' }
        }).select('name email role district municipality').limit(10);
        
        console.log(`Found ${usersWithDistrict.length} users with district information:`);
        usersWithDistrict.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name || 'No Name'} (${user.role}) - District: ${user.district}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

checkDistrictAdmins();