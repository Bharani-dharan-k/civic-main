const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');

async function createMunicipalAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/civic-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB...');

        // Check if municipal admin already exists
        const existingAdmin = await User.findOne({ 
            email: 'municipality1@admin.com',
            role: 'municipality_admin'
        });

        if (existingAdmin) {
            console.log('Municipal admin already exists:', existingAdmin.email);
            console.log('ID:', existingAdmin._id);
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('municipality123', salt);

        // Create municipal admin user
        const municipalAdmin = new User({
            name: 'Municipality Admin 1',
            email: 'municipality1@admin.com',
            password: hashedPassword,
            role: 'municipality_admin',
            adminRole: 'municipality_admin',
            district: 'Bokaro',
            municipality: 'Bokaro Steel City',
            ward: 'Ward 1',
            isActive: true
        });

        await municipalAdmin.save();
        console.log('✅ Municipal admin created successfully!');
        console.log('📧 Email: municipality1@admin.com');
        console.log('🔑 Password: municipality123');
        console.log('🆔 ID:', municipalAdmin._id);
        console.log('🏛️ Municipality:', municipalAdmin.municipality);
        console.log('🏘️ Ward:', municipalAdmin.ward);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating municipal admin:', error);
        process.exit(1);
    }
}

createMunicipalAdmin();
