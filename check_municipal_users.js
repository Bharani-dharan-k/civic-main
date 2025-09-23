const mongoose = require('mongoose');
const User = require('./server/models/User');

async function checkMunicipalUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/civic-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB...');

        // Find all municipal admin users
        const municipalAdmins = await User.find({ 
            role: 'municipality_admin' 
        }).select('name email role municipality district ward');

        console.log('Municipal Admin Users:');
        municipalAdmins.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - ${user.role} - ${user.municipality} - ${user.district} - Ward: ${user.ward}`);
        });

        // Find all admin users
        const allAdmins = await User.find({ 
            role: { $in: ['super_admin', 'district_admin', 'municipality_admin', 'department_head', 'field_head'] }
        }).select('name email role municipality district ward');

        console.log('\nAll Admin Users:');
        allAdmins.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - ${user.role} - ${user.municipality || 'N/A'} - ${user.district || 'N/A'} - Ward: ${user.ward || 'N/A'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkMunicipalUsers();
