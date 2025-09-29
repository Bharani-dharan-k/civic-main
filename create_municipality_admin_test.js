const axios = require('axios');

async function testCreateMunicipalityAdmin() {
    try {
        console.log('🧪 Creating Municipality Admin User...\n');

        // First login as district admin to create municipality admin
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'dilshan@gmail.com',
            password: '123456'
        });

        if (!loginResponse.data.success) {
            console.log('❌ District admin login failed:', loginResponse.data.message);
            return;
        }

        console.log('✅ District admin login successful');
        const token = loginResponse.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };

        // Create a municipality admin
        console.log('\n👤 Creating municipality admin...');
        try {
            const createResponse = await axios.post('http://localhost:5000/api/admin/users', {
                name: 'Test Municipality Admin',
                email: 'test.municipal.admin@example.com',
                role: 'municipality_admin',
                municipality: 'Ranchi',
                ward: '5',
                password: 'password123'
            }, { headers });

            if (createResponse.data.success) {
                console.log('✅ Municipality admin created successfully');
                console.log('📧 Email:', createResponse.data.user.email);
                console.log('🏛️ Municipality:', createResponse.data.user.municipality);
                console.log('📍 Ward:', createResponse.data.user.ward);
            } else {
                console.log('❌ Failed to create municipality admin:', createResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Error creating municipality admin:', error.response?.data?.message || error.message);
        }

        // Now test login with the new municipality admin
        console.log('\n📱 Testing new municipality admin login...');
        try {
            const municipalLoginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
                email: 'test.municipal.admin@example.com',
                password: 'password123'
            });

            if (municipalLoginResponse.data.success) {
                console.log('✅ Municipality admin login successful');
                const municipalToken = municipalLoginResponse.data.token;
                const municipalHeaders = { 'Authorization': `Bearer ${municipalToken}` };

                // Test municipal stats endpoint
                console.log('\n📊 Testing municipal stats with real user...');
                const statsResponse = await axios.get('http://localhost:5000/api/municipal/stats', { headers: municipalHeaders });
                
                if (statsResponse.data.success) {
                    console.log('✅ Municipal stats endpoint working with real user!');
                    console.log('📊 Stats:', statsResponse.data.data);
                } else {
                    console.log('❌ Municipal stats failed:', statsResponse.data.message);
                }
            } else {
                console.log('❌ Municipality admin login failed:', municipalLoginResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Error testing municipality admin login:', error.response?.data?.message || error.message);
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testCreateMunicipalityAdmin();