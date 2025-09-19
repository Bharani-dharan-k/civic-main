// Test script for settings API endpoints
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testSettingsAPI() {
    try {
        console.log('🔄 Testing settings API endpoints...');
        
        // Test profile endpoint
        try {
            const profileResponse = await axios.get(`${API_BASE_URL}/admin/settings/profile`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Profile API Status:', profileResponse.status);
        } catch (error) {
            console.log('❌ Profile API Error:', error.response?.status, error.response?.data?.message);
        }

        // Test notification settings endpoint
        try {
            const notificationResponse = await axios.get(`${API_BASE_URL}/admin/settings/notifications`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Notifications API Status:', notificationResponse.status);
        } catch (error) {
            console.log('❌ Notifications API Error:', error.response?.status, error.response?.data?.message);
        }

        // Test system settings endpoint
        try {
            const systemResponse = await axios.get(`${API_BASE_URL}/admin/settings/system`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ System Settings API Status:', systemResponse.status);
        } catch (error) {
            console.log('❌ System Settings API Error:', error.response?.status, error.response?.data?.message);
        }

    } catch (error) {
        console.log('❌ General Error:', error.message);
    }
}

testSettingsAPI();