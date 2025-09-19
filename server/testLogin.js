const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app');
        
        const user = await User.findOne({ email: 'dharun@gmail.com' });
        if (!user) {
            console.log('User not found');
            return;
        }
        
        console.log('User found:', user.name, user.email);
        console.log('Stored password hash:', user.password);
        
        // Test with common passwords
        const testPasswords = ['123456', 'password123', 'dharun123', 'admin123'];
        
        for (const password of testPasswords) {
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`Password '${password}' matches:`, isMatch);
            if (isMatch) {
                console.log('✅ CORRECT PASSWORD FOUND:', password);
                break;
            }
        }
        
        // Also test the comparePassword method
        console.log('\nTesting with user.comparePassword method:');
        for (const password of testPasswords) {
            const isMatch = await user.comparePassword(password);
            console.log(`Password '${password}' matches (method):`, isMatch);
        }
        
        mongoose.disconnect();
        
    } catch (error) {
        console.error('Error:', error);
    }
};

testLogin();