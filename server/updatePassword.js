const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const updateUserPassword = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app');
        console.log('Connected to MongoDB...');

        // Find and update the user
        const email = 'rajesh@example.com';
        const newPassword = 'password123';
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return;
        }
        
        console.log('Found user:', user.name);
        
        // Hash new password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        
        // Update password
        user.password = hashedPassword;
        await user.save();
        
        console.log('✅ Password updated successfully for:', user.name);
        
        // Test the password
        const isMatch = await bcrypt.compare(newPassword, hashedPassword);
        console.log('Password test:', isMatch ? '✅ Correct' : '❌ Failed');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

updateUserPassword();