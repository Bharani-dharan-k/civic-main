/**
 * Test script to debug the exact login error
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

const User = require('./models/User');

async function debugLogin() {
    try {
        console.log('🔍 Starting debug login test...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find Bhupesh
        console.log('\n🔍 Finding Bhupesh user...');
        const bhupesh = await User.findOne({ email: 'bhupesh@gmail.com' });
        
        if (!bhupesh) {
            console.log('❌ Bhupesh not found!');
            return;
        }
        
        console.log('✅ Bhupesh found!');
        console.log('- ID:', bhupesh._id);
        console.log('- Name:', bhupesh.name);
        console.log('- Email:', bhupesh.email);
        console.log('- Role:', bhupesh.role);
        console.log('- Ward:', bhupesh.ward);
        console.log('- Department:', bhupesh.department);
        console.log('- Municipality:', bhupesh.municipality);
        console.log('- District:', bhupesh.district);
        
        // Test password comparison
        console.log('\n🔍 Testing password comparison...');
        const testPassword = '123456';
        const isMatch = await bhupesh.comparePassword(testPassword);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('❌ Password does not match!');
            return;
        }
        
        console.log('✅ Password matches!');
        
        // Test JWT token creation
        console.log('\n🔍 Testing JWT token creation...');
        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'N/A');
        
        const payload = { 
            user: {
                id: bhupesh._id.toString(), 
                role: bhupesh.role,
                email: bhupesh.email,
                name: bhupesh.name,
                department: bhupesh.department,
                municipality: bhupesh.municipality,
                district: bhupesh.district,
                userType: 'admin'
            }
        };
        
        console.log('Token payload:', JSON.stringify(payload, null, 2));
        
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        console.log('✅ Token created successfully');
        console.log('Token length:', token.length);
        
        // Test saving user (update lastLogin)
        console.log('\n🔍 Testing user save (lastLogin update)...');
        bhupesh.lastLogin = new Date();
        await bhupesh.save();
        console.log('✅ User saved successfully');
        
        console.log('\n🎉 All login steps completed successfully!');
        console.log('The login should work without errors.');
        
        await mongoose.disconnect();
        console.log('✅ Disconnected from database');
        
    } catch (error) {
        console.error('❌ Debug login error:', error);
        console.error('Error stack:', error.stack);
        process.exit(1);
    }
}

debugLogin();