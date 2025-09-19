// Test script for escalation API endpoints
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test escalations endpoint
async function testEscalationsAPI() {
    try {
        console.log('🔄 Testing /admin/escalations endpoint...');
        
        // This is a simple test - in real app you'd need proper authentication
        const response = await axios.get(`${API_BASE_URL}/admin/escalations`, {
            headers: {
                'Authorization': 'Bearer test-token-for-district-admin'
            }
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('📊 Escalations Data:', response.data);
        
    } catch (error) {
        if (error.response) {
            console.log('❌ API Error Status:', error.response.status);
            console.log('❌ API Error Message:', error.response.data);
        } else {
            console.log('❌ Network Error:', error.message);
        }
    }
}

// Run the test
testEscalationsAPI();