const axios = require('axios');

const debugYahyaMunicipality = async () => {
    try {
        console.log('🔐 Logging in as Yahya...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'yahya@gmail.com',
            password: '123456'
        });
        
        console.log('✅ Login successful');
        console.log('Full user info:', JSON.stringify(loginResponse.data.user, null, 2));
        
        // Test the staff endpoint to see the actual query being made
        console.log('\n👥 Testing staff endpoint with debug info...');
        const staffResponse = await axios.get('http://localhost:5000/api/municipal/staff', {
            headers: { 'Authorization': `Bearer ${loginResponse.data.token}` }
        });
        
        console.log('Staff API response:', JSON.stringify(staffResponse.data, null, 2));
        
        // Now let's manually check what staff exist in the system
        console.log('\n🔍 Login as Bhupesh to check all staff...');
        const bhupeshLogin = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bhupesh@gmail.com',
            password: '123456'
        });
        
        const allStaffResponse = await axios.get('http://localhost:5000/api/municipal/staff', {
            headers: { 'Authorization': `Bearer ${bhupeshLogin.data.token}` }
        });
        
        console.log('All staff (via Bhupesh):', JSON.stringify(allStaffResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

debugYahyaMunicipality();