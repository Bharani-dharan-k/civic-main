const axios = require('axios');

async function testCreateAdmin() {
  try {
    console.log('Testing create admin endpoint...');
    
    // First get a super admin token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'bharani@gmail.com',
      password: '123456',
      role: 'super_admin'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Got super admin token');
    
    // Test create admin
    const response = await axios.post('http://localhost:5000/api/superadmin/create-admin', {
      name: 'Test District Admin',
      email: 'testdistrictadmin@example.com',
      password: '123456',
      role: 'district_admin',
      district: 'Test District',
      municipality: 'Test Municipality'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin creation successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Admin creation failed!');
    console.log('Status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Full error:', error.message);
    
    // Check for HTML response
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
      console.log('\n🔍 Server returned HTML error page instead of JSON!');
      console.log('Response text:', error.response.data.substring(0, 200) + '...');
    }
  }
}

testCreateAdmin();