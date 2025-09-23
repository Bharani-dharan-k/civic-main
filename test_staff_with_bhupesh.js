const axios = require('axios');

async function testStaffWithBhupesh() {
    try {
        console.log('🧪 Testing Staff API with Bhupesh...');
        
        // Login as Bhupesh
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bhupesh@gmail.com',
            password: '123456'
        });
        
        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        
        // Test the staff endpoint
        console.log('\n👥 Testing staff data endpoint...');
        const staffResponse = await axios.get('http://localhost:5000/api/municipal/staff', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Staff Response:', {
            success: staffResponse.data.success,
            count: staffResponse.data.data?.length || 0,
            data: staffResponse.data.data
        });
        
        // Test adding a staff member
        console.log('\n➕ Testing add staff member...');
        const addStaffResponse = await axios.post('http://localhost:5000/api/municipal/staff', {
            name: 'Test Field Worker',
            email: 'testworker@municipality.com',
            phone: '9876543210',
            role: 'field_staff',
            department: 'Public Works'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Add Staff Response:', addStaffResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testStaffWithBhupesh();