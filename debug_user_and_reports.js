const axios = require('axios');

async function debugUserAndReports() {
    try {
        console.log('🔍 Debugging User and Reports...');

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

        // Step 2: Get user data from protected endpoint
        console.log('\n2️⃣  Getting user profile...');
        try {
            const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ User profile data:');
            console.log(JSON.stringify(userResponse.data, null, 2));
        } catch (error) {
            console.log('❌ User profile error:', error.response?.data || error.message);
        }

        // Step 3: Test Municipal Stats endpoint (which works)
        console.log('\n3️⃣  Testing Municipal Stats endpoint...');
        try {
            const statsResponse = await axios.get('http://localhost:5000/api/municipal/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Municipal Stats:', statsResponse.data);
        } catch (error) {
            console.log('❌ Municipal Stats error:', error.response?.data || error.message);
        }

        // Step 4: Test Municipal Reports endpoint
        console.log('\n4️⃣  Testing Municipal Reports endpoint...');
        try {
            const reportsResponse = await axios.get('http://localhost:5000/api/municipal/reports', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Municipal Reports Response:');
            console.log('   Success:', reportsResponse.data.success);
            console.log('   Data length:', reportsResponse.data.data?.length || 0);
            if (reportsResponse.data.data?.length > 0) {
                console.log('   Sample report:', reportsResponse.data.data[0]);
            }
        } catch (error) {
            console.log('❌ Municipal Reports error:', error.response?.data || error.message);
        }

        // Step 5: Check available reports in the general reports endpoint
        console.log('\n5️⃣  Testing General Reports endpoint...');
        try {
            const allReportsResponse = await axios.get('http://localhost:5000/api/reports', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ General Reports Response:');
            console.log('   Data length:', allReportsResponse.data.reports?.length || 0);
            if (allReportsResponse.data.reports?.length > 0) {
                console.log('   Sample reports:');
                allReportsResponse.data.reports.slice(0, 3).forEach((report, index) => {
                    console.log(`   ${index + 1}. ${report.title}`);
                    console.log(`      Urban Local Body: ${report.urbanLocalBody}`);
                    console.log(`      Municipality: ${report.municipality || 'not set'}`);
                });
            }
        } catch (error) {
            console.log('❌ General Reports error:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

debugUserAndReports();