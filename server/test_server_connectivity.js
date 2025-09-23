const axios = require('axios');

async function testServer() {
  try {
    console.log('🧪 Testing server connectivity...');
    
    // Test basic endpoint
    const testResponse = await axios.get('http://localhost:5000/api/auth/test');
    console.log('✅ Server is responding:', testResponse.data);
    
    // Test admin login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'bharani@gmail.com',
      password: '123456'
    });
    
    console.log('✅ Admin login test successful!');
    console.log('Response:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Server test failed:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testServer();