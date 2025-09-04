const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB...');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'bharani@gmail.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('bharani5544', salt);

        // Create admin user
        const adminUser = new User({
            name: 'Admin Bharani',
            email: 'bharani@gmail.com',
            password: hashedPassword,
            phone: '+91-9876543210',
            role: 'admin',
            isActive: true
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: bharani@gmail.com');
        console.log('🔑 Password: bharani5544');
        console.log('👤 Role: admin');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    seedAdmin();
}

module.exports = seedAdmin;
