const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/civic_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected for seeding super admin...');
    seedSuperAdmin();
})
.catch(err => {
    console.log('Error connecting to MongoDB:', err);
});

const seedSuperAdmin = async () => {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ 
            email: 'bharani@gmail.com',
            role: 'super_admin'
        });

        if (existingSuperAdmin) {
            console.log('Super admin already exists:', existingSuperAdmin.email);
            process.exit(0);
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('bharani5544', salt);

        // Create super admin user
        const superAdmin = new User({
            name: 'Bharani Super Admin',
            email: 'bharani@gmail.com',
            password: hashedPassword,
            role: 'super_admin',
            adminRole: 'super_admin', // Also set adminRole for consistency
            isActive: true,
            district: 'All',
            municipality: 'All',
            department: 'All'
        });

        await superAdmin.save();
        console.log('✅ Super admin created successfully:', {
            name: superAdmin.name,
            email: superAdmin.email,
            role: superAdmin.role,
            adminRole: superAdmin.adminRole
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error);
        process.exit(1);
    }
};