const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const checkPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app');
        console.log('Connected to MongoDB...');

        const user = await User.findOne({ email: 'rajesh@example.com' });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('👤 Found user:', user.name);
        console.log('📧 Email:', user.email);
        console.log('🔑 Password hash:', user.password);
        
        // Test current password
        const isMatch1 = await bcrypt.compare('password123', user.password);
        console.log('Test "password123":', isMatch1 ? '✅ Match' : '❌ No match');
        
        // Force update password again
        const newHash = bcrypt.hashSync('password123', 10);
        console.log('🔧 New hash:', newHash);
        
        user.password = newHash;
        await user.save();
        console.log('✅ Password updated');
        
        // Test again
        const isMatch2 = await bcrypt.compare('password123', user.password);
        console.log('Test after update:', isMatch2 ? '✅ Match' : '❌ No match');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkPassword();