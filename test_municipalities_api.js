const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from server directory
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Connect to MongoDB
async function testMunicipalitiesAPI() {
    try {
        console.log('🔍 Testing municipality API functionality...');
        
        // Connect to MongoDB - use the Atlas connection string from .env
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_system_v2';
        console.log('🔗 Connecting to:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        // Import User model
        const User = require('./server/models/User');
        
        // Check district admin user
        const districtAdmin = await User.findOne({ 
            role: 'district_admin',
            email: { $in: ['admin@district.com', 'district@admin.com', 'bharanidharan@gmail.com'] }
        });
        
        if (!districtAdmin) {
            console.log('❌ No district admin found');
            return;
        }
        
        console.log('👤 District Admin found:');
        console.log(`   Name: ${districtAdmin.name}`);
        console.log(`   Email: ${districtAdmin.email}`);
        console.log(`   District: ${districtAdmin.district}`);
        console.log(`   Role: ${districtAdmin.role}`);
        
        // Test municipality mapping
        const municipalityMapping = {
            'Bokaro': ['Bokaro Steel City', 'Chas Municipality', 'Bermo Municipality', 'Jaridih Municipality', 'Gomia Municipality', 'Phusro Nagar Parishad'],
            'Ranchi': ['Ranchi Municipal Corporation', 'Bundu Nagar Panchayat', 'Tamar Nagar Panchayat', 'Sonahatu Nagar Panchayat', 'Angara Nagar Panchayat'],
            'Dhanbad': ['Dhanbad Municipal Corporation', 'Jharia Municipality', 'Sindri Municipality', 'Nirsa Municipality', 'Govindpur Municipality', 'Chirkunda Nagar Panchayat']
        };
        
        console.log('\n🏛️ Testing municipality mapping for district:', districtAdmin.district);
        const availableMunicipalities = municipalityMapping[districtAdmin.district] || [];
        console.log(`   Found ${availableMunicipalities.length} municipalities:`);
        availableMunicipalities.forEach((muni, index) => {
            console.log(`   ${index + 1}. ${muni}`);
        });
        
        // Check existing municipality admins
        const existingAdmins = await User.find({
            role: 'municipality_admin',
            district: districtAdmin.district
        }).select('name email municipality district');
        
        console.log(`\n👥 Existing municipality admins in ${districtAdmin.district}:`);
        if (existingAdmins.length === 0) {
            console.log('   No municipality admins found');
        } else {
            existingAdmins.forEach((admin, index) => {
                console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - ${admin.municipality}`);
            });
        }
        
        console.log('\n✅ API test data looks good!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

testMunicipalitiesAPI();