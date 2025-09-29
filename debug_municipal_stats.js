// Debug the municipal stats endpoint to see why it's returning 0 counts
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const testCredentials = {
  email: 'yahya@gmail.com',
  password: '123456',
  role: 'municipality_admin'
};

async function debugMunicipalStats() {
  try {
    console.log('🔍 Debugging Municipal Stats Endpoint...\n');
    
    // Step 1: Login to get token
    console.log('1️⃣  Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/admin/login`, testCredentials);
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Login successful');
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    
    // Decode JWT to see what's inside
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('\n🎫 JWT Token Payload:');
    console.log('   Municipality:', payload.user.municipality);
    console.log('   District:', payload.user.district);
    console.log('   Ward:', payload.user.ward);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Step 2: Call municipal stats with debug
    console.log('\n2️⃣  Calling municipal stats endpoint...');
    const statsResponse = await axios.get(`${BASE_URL}/api/municipal/stats`, { headers });
    
    console.log('✅ Municipal Stats Response:');
    console.log('   Status:', statsResponse.status);
    console.log('   Data:', JSON.stringify(statsResponse.data, null, 2));
    
    // Step 3: Check server logs for any debug output
    console.log('\n3️⃣  Check server terminal for debug logs showing:');
    console.log('   - Municipality value being used in query');
    console.log('   - Query being executed');
    console.log('   - Number of reports found');
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Check if municipality value is correctly extracted');
    console.log('   2. Verify query is using urbanLocalBody field');
    console.log('   3. Confirm reports exist with exact municipality name');
    
  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Run the debug
debugMunicipalStats();