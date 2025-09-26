const axios = require('axios');

const testYahyaAccess = async () => {
    try {
        console.log('🔐 Testing Yahya access...');
        
        // Login as Yahya
        // Try common passwords
        const passwords = ['123456', 'password123', 'admin123', 'yahya123'];
        let loginResponse = null;
        
        for (const password of passwords) {
            try {
                console.log(`🔍 Trying password: ${password}`);
                loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
                    email: 'yahya@gmail.com',
                    password: password
                });
                console.log(`✅ Password ${password} worked!`);
                break;
            } catch (error) {
                console.log(`❌ Password ${password} failed`);
            }
        }
        
        if (!loginResponse) {
            throw new Error('No valid password found');
        }
        
        console.log('✅ Yahya login successful');
        const token = loginResponse.data.token;
        console.log('User info:', loginResponse.data.user);
        
        // Test the staff endpoint for Chas Municipality
        console.log('\n👥 Testing staff data for Chas Municipality...');
        const staffResponse = await axios.get('http://localhost:5000/api/municipal/staff', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Staff Response:');
        console.log('Status:', staffResponse.status);
        console.log('Data:', JSON.stringify(staffResponse.data, null, 2));
        
        // Test municipal reports
        console.log('\n📊 Testing municipal reports for Chas Municipality...');
        const reportsResponse = await axios.get('http://localhost:5000/api/municipal/reports', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Reports Response:');
        console.log('Status:', reportsResponse.status);
        console.log('Count:', reportsResponse.data.data?.length || 0);
        console.log('Data:', JSON.stringify(reportsResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

testYahyaAccess();