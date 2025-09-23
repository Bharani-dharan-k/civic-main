const axios = require('axios');

async function testMunicipalReports() {
    try {
        // Get user token first
        console.log('🔐 Testing login for Bhupesh...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bhupesh@gmail.com',
            password: '123456'
        });

        if (!loginResponse.data.success) {
            console.error('❌ Login failed:', loginResponse.data);
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful, got token');

        // Test municipal reports endpoint
        console.log('\n📊 Testing municipal reports endpoint...');
        const reportsResponse = await axios.get('http://localhost:5000/api/municipal/reports', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Municipal Reports Response:');
        console.log('Success:', reportsResponse.data.success);
        console.log('Data length:', reportsResponse.data.data?.length || 0);
        console.log('Data:', JSON.stringify(reportsResponse.data.data, null, 2));

        // Test assigned tasks endpoint
        console.log('\n📋 Testing assigned tasks endpoint...');
        const tasksResponse = await axios.get('http://localhost:5000/api/municipal/tasks', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Assigned Tasks Response:');
        console.log('Success:', tasksResponse.data.success);
        console.log('Data length:', tasksResponse.data.data?.length || 0);
        console.log('Data:', JSON.stringify(tasksResponse.data.data, null, 2));

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testMunicipalReports();