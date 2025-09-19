const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🔄 Testing Admin Login...\n');

    const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'ashok@gmail.com',
      password: '123456'
    });

    console.log('Status:', response.status);
    console.log('Response:', response.data);

    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('🎟️ Token:', response.data.token ? 'Received' : 'Not received');
    } else {
      console.log('❌ Login failed:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Login error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
};

testLogin();