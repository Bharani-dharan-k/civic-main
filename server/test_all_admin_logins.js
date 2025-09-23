const axios = require('axios');

console.log('🧪 Testing All Admin Login Credentials...');

const testCredentials = [
  { email: 'bharani@gmail.com', password: '123456', role: 'super_admin' },
  { email: 'dilshan@gmail.com', password: '123456', role: 'district_admin' },
  { email: 'bhupesh@gmail.com', password: '123456', role: 'municipality_admin' },
  { email: 'dharun@gmail.com', password: '123456', role: 'department_head' },
  { email: 'ashok@gmail.com', password: '123456', role: 'district_admin' }
];

async function testAllLogins() {
  console.log('\n🔑 Testing admin logins...\n');
  
  for (const creds of testCredentials) {
    try {
      console.log(`Testing: ${creds.email} (${creds.role})`);
      
      const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
        email: creds.email,
        password: creds.password,
        role: creds.role
      });
      
      if (response.data.success) {
        console.log(`✅ SUCCESS: ${creds.email}`);
        console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
        console.log(`   User: ${response.data.user.name} (${response.data.user.role})`);
      } else {
        console.log(`❌ FAILED: ${creds.email} - ${response.data.message}`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${creds.email}`);
      console.log(`   Status: ${error.response?.status || 'No Response'}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('🎯 Test Summary:');
  console.log('All credentials should now work with password: 123456');
}

testAllLogins();