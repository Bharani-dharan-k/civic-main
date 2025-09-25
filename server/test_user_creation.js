const axios = require('axios');

async function testUserCreation() {
  try {
    console.log('Testing user creation endpoint...');
    
    // Test citizen registration
    const response = await axios.post('http://localhost:5000/api/auth/citizen/register', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: '123456',
      phone: '1234567890'
    });
    
    console.log('✅ User creation successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ User creation failed!');
    console.log('Status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Full error:', error.message);
    
    // Check if we're getting HTML instead of JSON
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
      console.log('\n🔍 Server returned HTML error page instead of JSON!');
      console.log('This indicates a server crash or missing route.');
    }
  }
}

testUserCreation();