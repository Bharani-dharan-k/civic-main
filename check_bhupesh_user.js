/**
 * Check if Bhupesh user exists and password is correct
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const User = require('./server/models/User');

async function checkBhupeshUser() {
    try {
        console.log('🔍 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        console.log('\n🔍 Looking for Bhupesh...');
        const bhupesh = await User.findOne({ email: 'bhupesh@gmail.com' });
        
        if (!bhupesh) {
            console.log('❌ Bhupesh user not found!');
            return;
        }
        
        console.log('✅ Bhupesh found!');
        console.log('Name:', bhupesh.name);
        console.log('Email:', bhupesh.email);
        console.log('Role:', bhupesh.role);
        console.log('Department:', bhupesh.department);
        console.log('Municipality:', bhupesh.municipality);
        console.log('District:', bhupesh.district);
        console.log('Ward:', bhupesh.ward);
        console.log('Password hash:', bhupesh.password);
        console.log('Hash length:', bhupesh.password.length);
        
        console.log('\n🔍 Testing password comparison...');
        
        // Test different possible passwords
        const testPasswords = ['password123', '123456', 'password', 'bhupesh123'];
        
        for (let testPassword of testPasswords) {
            console.log(`\nTesting password: "${testPassword}"`);
            
            // Test with user method
            const userMatch = await bhupesh.comparePassword(testPassword);
            console.log('User method result:', userMatch);
            
            // Test with bcrypt directly
            const directMatch = await bcrypt.compare(testPassword, bhupesh.password);
            console.log('Direct bcrypt result:', directMatch);
            
            if (userMatch || directMatch) {
                console.log(`✅ Correct password found: "${testPassword}"`);
                break;
            }
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from database');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkBhupeshUser();