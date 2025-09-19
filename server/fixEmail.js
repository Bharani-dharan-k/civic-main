const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixDharunEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app');
        
        console.log('=== FIXING DHARUN EMAIL ===');
        
        // Check if user wants the new email
        const existingUser = await User.findOne({ email: 'dharun@gmail.com' });
        if (existingUser) {
            console.log('Current user:', existingUser.name, existingUser.email);
            
            // Update to the typo email if that's what user expects
            existingUser.email = 'dharaun@gmail.com';
            await existingUser.save();
            
            console.log('✅ Updated email to:', existingUser.email);
        }
        
        mongoose.disconnect();
        console.log('Disconnected from database');
        
    } catch (error) {
        console.error('Error:', error);
    }
};

// Uncomment the line below to run the fix
// fixDharunEmail();

console.log('To fix the email typo issue, run:');
console.log('1. Use correct email: dharun@gmail.com');
console.log('2. Or uncomment fixDharunEmail() call to update the email in database');