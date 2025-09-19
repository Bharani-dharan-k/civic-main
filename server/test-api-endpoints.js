const axios = require('axios');
require('dotenv').config();

async function testDepartmentHeadAPIs() {
    console.log('🔍 Testing Department Head API endpoints...\n');

    try {
        // First, login as Dharun
        console.log('1. Logging in as Dharun...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'dharun@gmail.com',
            password: '123456',
            role: 'department_head'
        });

        if (!loginResponse.data.success) {
            console.error('❌ Login failed:', loginResponse.data.message);
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('User:', JSON.stringify(loginResponse.data.user, null, 2));
        console.log('Token:', token.substring(0, 50) + '...\n');

        // Setup headers with token
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Test dashboard endpoint
        console.log('2. Testing /dashboard endpoint...');
        try {
            const dashboardResponse = await axios.get('http://localhost:5000/api/department-head/dashboard', { headers });
            console.log('✅ Dashboard endpoint response:');
            console.log(JSON.stringify(dashboardResponse.data, null, 2));
            console.log('\n');
        } catch (dashboardError) {
            console.error('❌ Dashboard endpoint error:');
            console.error('Status:', dashboardError.response?.status);
            console.error('Message:', dashboardError.response?.data);
            console.log('\n');
        }

        // Test tasks endpoint
        console.log('3. Testing /tasks endpoint...');
        try {
            const tasksResponse = await axios.get('http://localhost:5000/api/department-head/tasks', { headers });
            console.log('✅ Tasks endpoint response:');
            console.log(JSON.stringify(tasksResponse.data, null, 2));
            console.log('\n');
        } catch (tasksError) {
            console.error('❌ Tasks endpoint error:');
            console.error('Status:', tasksError.response?.status);
            console.error('Message:', tasksError.response?.data);
            console.log('\n');
        }

        // Test other endpoints
        const endpoints = ['/staff', '/resources', '/projects', '/budget', '/complaints'];
        
        for (const endpoint of endpoints) {
            console.log(`4. Testing ${endpoint} endpoint...`);
            try {
                const response = await axios.get(`http://localhost:5000/api/department-head${endpoint}`, { headers });
                console.log(`✅ ${endpoint} endpoint response:`, response.data);
            } catch (error) {
                console.error(`❌ ${endpoint} endpoint error:`, error.response?.status, error.response?.data);
            }
            console.log();
        }

    } catch (error) {
        console.error('❌ Error in API testing:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testDepartmentHeadAPIs();