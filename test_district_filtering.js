const axios = require('axios');

// Test script to verify district filtering is working correctly
const API_BASE = 'http://localhost:5000/api';

// Set axios defaults
axios.defaults.timeout = 10000;

// Test district admin login and data filtering
async function testDistrictFiltering() {
    console.log('🔍 Testing District Admin Data Filtering...\n');
    
    try {
        // First test if server is reachable
        console.log('0️⃣ Testing Server Connection...');
        const healthResponse = await axios.get('http://localhost:5000');
        console.log('✅ Server is reachable');
        
        // Test 1: Login as district admin
        console.log('\n1️⃣ Testing District Admin Login...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'dilshan@gmail.com', // Actual district admin from database
            password: '123456' // Correct password
        });
        
        console.log('Login response status:', loginResponse.status);
        console.log('Login response data:', loginResponse.data);
        
        if (loginResponse.data.success) {
            const token = loginResponse.data.token;
            const userInfo = loginResponse.data.user;
            console.log(`✅ Login successful for: ${userInfo.name} (District: ${userInfo.district})`);
            
            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            // Test 2: Get dashboard statistics
            console.log('\n2️⃣ Testing Dashboard Statistics...');
            const statsResponse = await axios.get(`${API_BASE}/admin/stats`, { headers });
            if (statsResponse.data.success) {
                console.log('✅ Dashboard Stats:', {
                    district: statsResponse.data.district,
                    totalReports: statsResponse.data.totalReports,
                    pendingReports: statsResponse.data.pending,
                    resolvedReports: statsResponse.data.resolved
                });
            }
            
            // Test 3: Get reports (should be district-filtered)
            console.log('\n3️⃣ Testing Reports Filtering...');
            const reportsResponse = await axios.get(`${API_BASE}/admin/reports?limit=5`, { headers });
            if (reportsResponse.data.success) {
                console.log(`✅ Reports loaded: ${reportsResponse.data.reports.length} reports`);
                console.log('District information:', {
                    district: reportsResponse.data.district,
                    firstReportDistrict: reportsResponse.data.reports[0]?.district || 'No reports'
                });
            }
            
            // Test 4: Get district users
            console.log('\n4️⃣ Testing District Users Filtering...');
            const usersResponse = await axios.get(`${API_BASE}/admin/users`, { headers });
            if (usersResponse.data.success) {
                console.log(`✅ District users loaded: ${usersResponse.data.users.length} users`);
                console.log('District information:', {
                    district: usersResponse.data.district,
                    sampleUserDistricts: usersResponse.data.users.slice(0, 3).map(u => u.district)
                });
            }
            
            // Test 5: Get notifications
            console.log('\n5️⃣ Testing Notifications Filtering...');
            const notificationsResponse = await axios.get(`${API_BASE}/admin/notifications`, { headers });
            if (notificationsResponse.data.success) {
                console.log(`✅ Notifications loaded: ${notificationsResponse.data.notifications.length} notifications`);
                console.log('District information:', {
                    district: notificationsResponse.data.district,
                    unreadCount: notificationsResponse.data.unreadCount
                });
            }
            
        } else {
            console.error('❌ Login failed:', loginResponse.data.message);
        }
        
    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data.message);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
    
    console.log('\n🎯 District filtering test completed!');
}

// Run the test
testDistrictFiltering();