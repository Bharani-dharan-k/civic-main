/**
 * Simple test to debug login issue
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
    console.log('🔍 Testing Direct Login Request...');
    
    try {
        console.log('Making request to:', `${BASE_URL}/auth/admin/login`);
        console.log('With data:', { email: 'bhupesh@gmail.com', password: '123456' });
        
        const response = await axios.post(`${BASE_URL}/auth/admin/login`, {
            email: 'bhupesh@gmail.com',
            password: '123456'
        }, {
            timeout: 10000,
            validateStatus: () => true // Don't throw on 4xx/5xx
        });
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
    } catch (error) {
        console.error('Request failed with error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testLogin();