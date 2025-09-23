// Test script to login as super admin and get a real token
const axios = require('axios');

const testSuperAdminLogin = async () => {
    try {
        console.log('🔐 Testing super admin login...');

        const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bharani@gmail.com',
            password: 'password',
            role: 'super_admin'
        });

        if (response.data.success) {
            console.log('✅ Super admin login successful!');
            console.log('📧 Email:', response.data.user.email);
            console.log('👤 Name:', response.data.user.name);
            console.log('🔑 Role:', response.data.user.role);
            console.log('🎫 Token:', response.data.token);

            // Test analytics endpoint with this token
            console.log('\n🔍 Testing analytics endpoint...');
            const analyticsResponse = await axios.get('http://localhost:5000/api/superadmin/analytics', {
                headers: {
                    'Authorization': `Bearer ${response.data.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (analyticsResponse.data.success) {
                console.log('✅ Analytics endpoint working!');
                console.log('📊 Total Reports:', analyticsResponse.data.data.overview.totalReports);
                console.log('📊 Total Users:', analyticsResponse.data.data.overview.totalUsers);
                console.log('📊 Resolved Reports:', analyticsResponse.data.data.performanceMetrics.resolvedReports);
            } else {
                console.log('❌ Analytics endpoint failed:', analyticsResponse.data);
            }

        } else {
            console.log('❌ Login failed:', response.data);
        }
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

testSuperAdminLogin();