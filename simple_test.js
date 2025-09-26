const axios = require('axios');

async function simpleTest() {
    try {
        // Step 1: Login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'yahya@gmail.com',
            password: '123456'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Step 2: Test municipal reports
        const reportsResponse = await axios.get('http://localhost:5000/api/municipal/reports', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📋 Municipal Reports Result:');
        console.log('Success:', reportsResponse.data.success);
        console.log('Count:', reportsResponse.data.data?.length || 0);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

simpleTest();