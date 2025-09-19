const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/civic_app')
.then(() => {
    console.log('MongoDB connected for checking admin...');
    checkAdmin();
})
.catch(err => {
    console.log('Error connecting to MongoDB:', err);
});

const checkAdmin = async () => {
    try {
        const admin = await User.findOne({ email: 'bharani@gmail.com' });
        
        if (admin) {
            console.log('Admin found with details:');
            console.log('- Name:', admin.name);
            console.log('- Email:', admin.email);
            console.log('- Role:', admin.role);
            console.log('- AdminRole:', admin.adminRole);
            console.log('- District:', admin.district);
            console.log('- Department:', admin.department);
        } else {
            console.log('No admin found with email bharani@gmail.com');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error checking admin:', error);
        process.exit(1);
    }
};