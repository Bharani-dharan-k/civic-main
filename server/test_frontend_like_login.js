const axios = require('axios');

async function testAdminLoginLikeFrontend() {
  try {
    console.log('Testing admin login endpoint like frontend...');
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Test the exact request from frontend
    const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'bhupesh@gmail.com',
      password: '123456',
      role: 'municipality_admin'
    }, config);
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Full error:', error.message);
    
    if (error.response?.status === 400) {
      console.log('\n🔍 This matches the 400 error from frontend!');
    }
  }
}

// Also test other admin accounts
async function testOtherAdmins() {
  const testAccounts = [
    { email: 'bharani@gmail.com', password: '123456', role: 'super_admin' },
    { email: 'ashok@gmail.com', password: '123456', role: 'district_admin' },
    { email: 'dharun@gmail.com', password: '123456', role: 'department_head' }
  ];
  
  for (const account of testAccounts) {
    try {
      console.log(`\n🧪 Testing ${account.email}...`);
      const response = await axios.post('http://localhost:5000/api/auth/admin/login', account);
      console.log(`✅ ${account.email} login successful!`);
    } catch (error) {
      console.log(`❌ ${account.email} login failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

async function runTests() {
  await testAdminLoginLikeFrontend();
  await testOtherAdmins();
}

runTests();