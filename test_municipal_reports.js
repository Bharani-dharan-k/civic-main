const axios = require('axios');

async function testMunicipalReports() {
    try {
        console.log('🔍 Testing Municipal Reports API...');

        // Step 1: Login
        console.log('\n1️⃣  Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'yahya@gmail.com',
            password: '123456'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('   User:', loginResponse.data.user.name);
        console.log('   Municipality:', loginResponse.data.user.municipality);
        console.log('   Full user data:', JSON.stringify(loginResponse.data.user, null, 2));

        // Step 2: Test Municipal Reports endpoint
        console.log('\n2️⃣  Testing Municipal Reports endpoint...');
        const reportsResponse = await axios.get('http://localhost:5000/api/municipal/reports', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Municipal Reports Response:');
        console.log('   Status:', reportsResponse.status);
        console.log('   Success:', reportsResponse.data.success);
        console.log('   Data length:', reportsResponse.data.data?.length || 0);
        
        if (reportsResponse.data.data && reportsResponse.data.data.length > 0) {
            console.log('\n📋 Sample reports:');
            reportsResponse.data.data.slice(0, 3).forEach((report, index) => {
                console.log(`   ${index + 1}. ${report.title}`);
                console.log(`      Category: ${report.category}`);
                console.log(`      Status: ${report.status}`);
                console.log(`      Urban Local Body: ${report.urbanLocalBody}`);
                console.log(`      Created: ${new Date(report.createdAt).toLocaleDateString()}`);
            });
        } else {
            console.log('⚠️  No reports found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

testMunicipalReports();