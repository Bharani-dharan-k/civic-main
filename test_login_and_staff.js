const axios = require('axios');

const testLogin = async () => {
    try {
        console.log('🔐 Testing municipal admin login...');
        
        const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'yahya@chas.in',
            password: 'password123'
        });
        
        console.log('✅ Login Response:');
        console.log('Status:', response.status);
        console.log('Token:', response.data.token);
        console.log('User:', response.data.user);
        
        // Now test staff API with fresh token
        console.log('\n🧪 Testing municipal staff API with fresh token...');
        
        const staffResponse = await axios.get('http://localhost:5000/api/municipal/staff', {
            headers: {
                'Authorization': `Bearer ${response.data.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Staff API Response:');
        console.log('Status:', staffResponse.status);
        console.log('Data:', JSON.stringify(staffResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data || error.message);
    }
};

testLogin();