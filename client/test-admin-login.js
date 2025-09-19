// Test script to debug admin login
const axios = require('axios');

const testAdminLogin = async () => {
  console.log('Testing admin login...');
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'bharani@gmail.com',
      password: 'password',
      role: 'super_admin'
    });
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
};

testAdminLogin();