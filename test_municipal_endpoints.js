const axios = require('axios');

const testMunicipalEndpoints = async () => {
    try {
        console.log('🏛️ Testing Municipal Dashboard Endpoints...\n');

        // First, login as a municipality admin
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'test.municipality.admin@example.com', // Using the municipality admin we created
            password: 'password123'
        });

        if (!loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data.message);
            return;
        }

        console.log('✅ Login successful');
        console.log('👤 User:', loginResponse.data.user.name);
        console.log('🏛️ Municipality:', loginResponse.data.user.municipality || 'Not set');
        
        const token = loginResponse.data.token;

        // Test all municipal endpoints
        const endpoints = [
            { name: 'Municipal Stats', url: 'http://localhost:5000/api/municipal/stats' },
            { name: 'Service Requests', url: 'http://localhost:5000/api/municipal/service-requests' },
            { name: 'Emergency Alerts', url: 'http://localhost:5000/api/municipal/emergency-alerts' },
            { name: 'Municipal Reports', url: 'http://localhost:5000/api/municipal/reports' },
            { name: 'Municipal Staff', url: 'http://localhost:5000/api/municipal/staff' }
        ];

        console.log('\n🔗 Testing Municipal Endpoints:');
        console.log('================================');

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(endpoint.url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`✅ ${endpoint.name}:`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Success: ${response.data.success}`);
                
                if (Array.isArray(response.data.data)) {
                    console.log(`   Data Count: ${response.data.data.length} items`);
                } else if (typeof response.data.data === 'object' && response.data.data) {
                    console.log(`   Data: ${Object.keys(response.data.data).length} properties`);
                    console.log(`   Sample: ${JSON.stringify(response.data.data).substring(0, 100)}...`);
                }
                console.log('');

            } catch (error) {
                console.log(`❌ ${endpoint.name}:`);
                console.log(`   Status: ${error.response?.status || 'No response'}`);
                console.log(`   Error: ${error.response?.data?.message || error.message}`);
                console.log('');
            }
        }

    } catch (error) {
        console.error('❌ Error testing municipal endpoints:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
    }
};

testMunicipalEndpoints();