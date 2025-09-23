/**
 * Update Bhupesh user to add ward field
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const User = require('./models/User');

async function updateBhupeshWard() {
    try {
        console.log('🔍 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        console.log('\n🔍 Updating Bhupesh...');
        const bhupesh = await User.findOneAndUpdate(
            { email: 'bhupesh@gmail.com' },
            { 
                ward: 'Ward 1',
                // Also remove the adminRole validation issue
                $unset: { adminRole: 1 }
            },
            { new: true }
        );
        
        if (!bhupesh) {
            console.log('❌ Bhupesh user not found!');
            return;
        }
        
        console.log('✅ Bhupesh updated!');
        console.log('Name:', bhupesh.name);
        console.log('Email:', bhupesh.email);
        console.log('Role:', bhupesh.role);
        console.log('Ward:', bhupesh.ward);
        console.log('Department:', bhupesh.department);
        console.log('Municipality:', bhupesh.municipality);
        console.log('District:', bhupesh.district);
        
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from database');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateBhupeshWard();