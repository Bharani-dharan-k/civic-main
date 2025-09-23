/**
 * Fix Bhupesh user by adding the missing adminRole field
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const User = require('./models/User');

async function fixBhupeshAdminRole() {
    try {
        console.log('🔍 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        console.log('\n🔍 Updating Bhupesh admin role...');
        const bhupesh = await User.findOneAndUpdate(
            { email: 'bhupesh@gmail.com' },
            { 
                adminRole: 'municipality_admin', // Set the required adminRole field
                ward: 'Ward 1' // Ensure ward is set
            },
            { new: true }
        );
        
        if (!bhupesh) {
            console.log('❌ Bhupesh user not found!');
            return;
        }
        
        console.log('✅ Bhupesh updated successfully!');
        console.log('- Name:', bhupesh.name);
        console.log('- Email:', bhupesh.email);
        console.log('- Role:', bhupesh.role);
        console.log('- AdminRole:', bhupesh.adminRole);
        console.log('- Ward:', bhupesh.ward);
        console.log('- Department:', bhupesh.department);
        console.log('- Municipality:', bhupesh.municipality);
        console.log('- District:', bhupesh.district);
        
        // Test that the user can now be saved
        console.log('\n🔍 Testing user save...');
        bhupesh.lastLogin = new Date();
        await bhupesh.save();
        console.log('✅ User save successful - login should now work!');
        
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from database');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixBhupeshAdminRole();