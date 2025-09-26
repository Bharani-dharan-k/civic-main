const axios = require('axios');

async function testMunicipalEndpoints() {
    try {
        console.log('🧪 Testing Municipal Endpoints...\n');

        // First login to get a valid token
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'test.municipal.admin@example.com',
            password: 'password123'
        });

        if (!loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data.message);
            return;
        }

        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };

        // Test infrastructure endpoint
        console.log('\n🏗️ Testing infrastructure endpoint...');
        try {
            const infraResponse = await axios.get('http://localhost:5000/api/municipal/infrastructure', { headers });
            console.log('✅ Infrastructure endpoint working:', infraResponse.status);
        } catch (error) {
            console.log('❌ Infrastructure endpoint error:', error.status, error.response?.data?.message || error.message);
        }

        // Test finance endpoint
        console.log('\n💰 Testing finance endpoint...');
        try {
            const financeResponse = await axios.get('http://localhost:5000/api/municipal/finance', { headers });
            console.log('✅ Finance endpoint working:', financeResponse.status);
        } catch (error) {
            console.log('❌ Finance endpoint error:', error.status, error.response?.data?.message || error.message);
        }

        // Test projects endpoint
        console.log('\n🏗️ Testing projects endpoint...');
        try {
            const projectsResponse = await axios.get('http://localhost:5000/api/municipal/projects', { headers });
            console.log('✅ Projects endpoint working:', projectsResponse.status);
        } catch (error) {
            console.log('❌ Projects endpoint error:', error.status, error.response?.data?.message || error.message);
        }

        // Test department admins endpoint
        console.log('\n👥 Testing department admins endpoint...');
        try {
            const adminsResponse = await axios.get('http://localhost:5000/api/municipal/department-admins', { headers });
            console.log('✅ Department admins endpoint working:', adminsResponse.status);
        } catch (error) {
            console.log('❌ Department admins endpoint error:', error.status, error.response?.data?.message || error.message);
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testMunicipalEndpoints();