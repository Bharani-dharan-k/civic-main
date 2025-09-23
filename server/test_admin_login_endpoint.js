const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login endpoint...');
    
    // Test with bhupesh@gmail.com
    const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'bhupesh@gmail.com',
      password: '123456',
      role: 'municipality_admin'
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('Login failed!');
    console.log('Status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Error message:', error.message);
  }
}

testAdminLogin();