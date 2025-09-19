const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test admin API endpoints
async function testAdminAPIs() {
    try {
        console.log('🔄 Testing Admin Login...');
        
        // Step 1: Login as admin
        const loginResponse = await axios.post(`${BASE_URL}/auth/admin/login`, {
            email: 'ashok@gmail.com',
            password: '123456'
        });
        
        console.log('✅ Admin Login successful');
        console.log('Token received:', loginResponse.data.token?.substring(0, 20) + '...');
        
        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        
        // Step 2: Test admin stats endpoint
        console.log('\n🔄 Testing /api/admin/stats...');
        const statsResponse = await axios.get(`${BASE_URL}/admin/stats`, { headers });
        console.log('✅ Stats endpoint working');
        console.log('Stats data:', JSON.stringify(statsResponse.data, null, 2));
        
        // Step 3: Test admin reports endpoint
        console.log('\n🔄 Testing /api/admin/reports...');
        const reportsResponse = await axios.get(`${BASE_URL}/admin/reports`, { headers });
        console.log('✅ Reports endpoint working');
        console.log('Reports count:', reportsResponse.data.reports?.length || 'No reports field');
        console.log('Response structure:', Object.keys(reportsResponse.data));
        
        // Step 4: Test other endpoints
        console.log('\n🔄 Testing /api/admin/leaderboard...');
        const leaderboardResponse = await axios.get(`${BASE_URL}/admin/leaderboard`, { headers });
        console.log('✅ Leaderboard endpoint working');
        console.log('Leaderboard data available');
        
    } catch (error) {
        console.error('❌ Error testing admin APIs:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Run the test
testAdminAPIs();