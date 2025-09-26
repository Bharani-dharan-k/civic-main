const mongoose = require('mongoose');

const testDatabaseConnection = async () => {
    try {
        // Connect to MongoDB Atlas
        const dbURL = 'mongodb+srv://sanjayd2022:Ahm3dMuhammed@cluster0.zyceh.mongodb.net/sihdcivic?retryWrites=true&w=majority';
        await mongoose.connect(dbURL);
        console.log('✅ Connected to MongoDB Atlas');
        
        // Check for municipal admins
        console.log('\n🔍 Checking for municipal admins...');
        const admins = await mongoose.connection.db.collection('users').find({
            role: 'municipality_admin'
        }).toArray();
        
        console.log(`Found ${admins.length} municipal admins:`);
        admins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.municipality}`);
        });
        
        // Check for all admin types
        console.log('\n🔍 Checking for all admin types...');
        const allAdmins = await mongoose.connection.db.collection('users').find({
            role: { $in: ['admin', 'municipality_admin', 'district_admin'] }
        }).toArray();
        
        console.log(`Found ${allAdmins.length} total admins:`);
        allAdmins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.name} (${admin.email}) - Role: ${admin.role} - Municipality: ${admin.municipality || 'N/A'}`);
        });
        
    } catch (error) {
        console.error('❌ Database error:', error);
    } finally {
        mongoose.disconnect();
    }
};

testDatabaseConnection();