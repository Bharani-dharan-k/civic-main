const mongoose = require('mongoose');
const User = require('./server/models/User');

async function checkDBUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/civic-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB...');

        // Find the municipal admin user
        const municipalAdmin = await User.findOne({ 
            email: 'municipality1@admin.com'
        });

        if (municipalAdmin) {
            console.log('✅ Municipal admin found in database:');
            console.log('ID:', municipalAdmin._id);
            console.log('Email:', municipalAdmin.email);
            console.log('Role:', municipalAdmin.role);
            console.log('Municipality:', municipalAdmin.municipality);
            console.log('Ward:', municipalAdmin.ward);
        } else {
            console.log('❌ Municipal admin not found in database');
        }

        // Find all users with municipality_admin role
        const allMunicipalAdmins = await User.find({ 
            role: 'municipality_admin'
        });

        console.log('\nAll municipal admin users:');
        allMunicipalAdmins.forEach(user => {
            console.log(`- ${user.email} (${user._id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDBUser();
