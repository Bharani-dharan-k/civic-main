const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testDistrictAdminLogins() {
  console.log('🧪 Testing all district admin login credentials\n');
  
  const testAccounts = [
    { email: 'dilshan@gmail.com', password: '123456', district: 'Bokaro' },
    { email: 'bhagath@gmail.com', password: '123456', district: 'Chatra' }
  ];
  
  let successCount = 0;
  
  for (const account of testAccounts) {
    console.log(`📧 Testing: ${account.email} (${account.district})`);
    
    try {
      const response = await axios.post(`${API_BASE}/auth/admin/login`, {
        email: account.email,
        password: account.password
      });
      
      console.log(`   📋 Response status: ${response.status}`);
      console.log(`   📋 Response data:`, JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.token) {
        console.log(`✅ Login successful!`);
        if (response.data.admin || response.data.user) {
          const user = response.data.admin || response.data.user;
          console.log(`   👤 Name: ${user.name}`);
          console.log(`   🏢 Role: ${user.role}`);
          console.log(`   📍 District: ${user.district}`);
        }
        console.log(`   🎟️  Token: ${response.data.token.substring(0, 20)}...`);
        successCount++;
      } else {
        console.log(`❌ Login failed - No token received`);
      }
    } catch (error) {
      console.log(`❌ Login failed: ${error.response?.data?.message || error.message}`);
      if (error.response?.data) {
        console.log(`   📋 Error response:`, JSON.stringify(error.response.data, null, 2));
      }
    }
    
    console.log('   ' + '─'.repeat(50));
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Successful logins: ${successCount}/${testAccounts.length}`);
  console.log(`❌ Failed logins: ${testAccounts.length - successCount}/${testAccounts.length}`);
  
  if (successCount === testAccounts.length) {
    console.log('\n🎉 All district admin accounts are working perfectly!');
  } else {
    console.log('\n⚠️  Some accounts need attention');
  }
}

testDistrictAdminLogins();