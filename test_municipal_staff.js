const axios = require('axios');

async function testMunicipalStaffAPI() {
    try {
        console.log('🧪 Testing Municipal Staff API...');
        
        // First, let's try to login as a municipal admin
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'municipality1@admin.com',
            password: 'municipality123'
        });
        
        console.log('✅ Login successful:', loginResponse.data);
        const token = loginResponse.data.token;
        
        // Now test the staff endpoint
        const staffResponse = await axios.get('http://localhost:5000/api/municipal/staff', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Staff data retrieved:', staffResponse.data);
        
        // Test adding a staff member
        const addStaffResponse = await axios.post('http://localhost:5000/api/municipal/staff', {
            name: 'Test Staff',
            email: 'teststaff@test.com',
            phone: '1234567890',
            role: 'field_staff',
            department: 'Health Services'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Staff member added:', addStaffResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testMunicipalStaffAPI();
