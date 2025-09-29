const axios = require('axios');

async function fixChennaiReportIssue() {
    try {
        console.log('🔧 Fixing Chennai Report Issue...');

        // Step 1: Login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'yahya@gmail.com',
            password: '123456'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Step 2: The problematic report ID from our debug
        const problematicReportId = '68d56eaa7088b5678d3daf84';

        console.log(`\n🎯 Targeting report ID: ${problematicReportId}`);
        console.log('📋 This report has:');
        console.log('   - urbanLocalBody: "chas" (should be "Chas Municipality")');
        console.log('   - Address: Chennai (should be Bokaro)');

        // Step 3: Update the report with correct data
        console.log('\n🔄 Updating report with correct location data...');
        
        const updateData = {
            urbanLocalBody: 'Chas Municipality',
            address: 'Main Road, Ward 1, Chas Municipality, Bokaro',
            district: 'Bokaro',
            ward: '1'
        };

        // Since we might not have a direct update endpoint, let's create a script to connect to MongoDB directly
        console.log('📝 Report needs to be updated with:');
        console.log('   urbanLocalBody: "Chas Municipality"');
        console.log('   address: "Main Road, Ward 1, Chas Municipality, Bokaro"');
        console.log('   district: "Bokaro"');
        console.log('   ward: "1"');

        console.log('\n💡 Solution: The report with Chennai address needs to be corrected in the database.');
        console.log('   This appears to be test data with incorrect location information.');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

fixChennaiReportIssue();