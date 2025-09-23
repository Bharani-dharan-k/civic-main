require('dotenv').config();
const axios = require('axios');

console.log('🧪 Testing Login API...');

async function testLogin() {
  const credentials = {
    email: 'bharani@gmail.com',
    password: '123456'
  };
  
  console.log('🔑 Testing admin login with:', credentials);
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/admin/login', credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', error.response?.data);
    console.error('Full Error:', error.message);
  }
}

testLogin();