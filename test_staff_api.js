const axios = require('axios');

const testStaffAPI = async () => {
    try {
        // Use Yahya's token to test staff API
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NzNlYjEzZTdmMTIwYzNkMzU1ZDhkZiIsInJvbGUiOiJtdW5pY2lwYWxpdHlfYWRtaW4iLCJpYXQiOjE3MzU2NDU5NzksImV4cCI6MTczODIzNzk3OX0.vJVKB7jSJFk8vZZV8C6SxeTZtFvIgPFIJrGJV2Vdl-E";
        
        console.log('🧪 Testing municipal staff API...');
        
        const response = await axios.get('http://localhost:5000/api/municipal/staff', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Staff API Response:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Staff API Error:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data || error.message);
    }
};

testStaffAPI();