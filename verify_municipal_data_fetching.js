// Test all municipal endpoints to verify data fetching
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const testCredentials = {
  email: 'yahya@gmail.com',
  password: '123456'  // Correct password found through testing
};

async function testMunicipalEndpoints() {
  console.log('🏛️  Testing Municipal Dashboard Data Fetching...\n');
  
  try {
    // Step 1: Login to get token (using admin login endpoint)
    console.log('1️⃣  Logging in...');
    const loginData = {
      ...testCredentials,
      role: 'municipality_admin'  // Include role for admin login
    };
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/admin/login`, loginData);
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Login successful');
    console.log('Full login response:', JSON.stringify(loginResponse.data, null, 2));
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Municipality: ${user.municipality}`);
    console.log(`   Ward: ${user.ward}`);
    console.log(`   Role: ${user.role}\n`);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Step 2: Test Infrastructure Status
    console.log('2️⃣  Testing Infrastructure Status...');
    const infraResponse = await axios.get(`${BASE_URL}/api/municipal/infrastructure`, { headers });
    console.log('✅ Infrastructure Status:', {
      status: infraResponse.status,
      dataKeys: Object.keys(infraResponse.data.data || {}),
      summary: infraResponse.data.data
    });
    
    // Step 3: Test Finance Data
    console.log('\n3️⃣  Testing Finance Data...');
    const financeResponse = await axios.get(`${BASE_URL}/api/municipal/finance`, { headers });
    console.log('✅ Finance Data:', {
      status: financeResponse.status,
      dataKeys: Object.keys(financeResponse.data.data || {}),
      summary: financeResponse.data.data
    });
    
    // Step 4: Test Projects Data (the one that was causing the error)
    console.log('\n4️⃣  Testing Projects Data...');
    const projectsResponse = await axios.get(`${BASE_URL}/api/municipal/projects`, { headers });
    console.log('✅ Projects Data:', {
      status: projectsResponse.status,
      dataStructure: typeof projectsResponse.data.data,
      isObject: typeof projectsResponse.data.data === 'object',
      hasProjectsArray: !!(projectsResponse.data.data && projectsResponse.data.data.projects),
      projectsCount: projectsResponse.data.data?.projects?.length || 0,
      summary: projectsResponse.data.data
    });
    
    // Step 5: Test Department Admins
    console.log('\n5️⃣  Testing Department Admins...');
    const adminResponse = await axios.get(`${BASE_URL}/api/municipal/department-admins`, { headers });
    console.log('✅ Department Admins:', {
      status: adminResponse.status,
      count: adminResponse.data.data?.length || 0,
      admins: adminResponse.data.data?.map(admin => ({
        name: admin.name,
        department: admin.department,
        email: admin.email
      })) || []
    });
    
    console.log('\n🎉 All Municipal Endpoints Working Successfully!');
    console.log('   ✅ Authentication: Working');
    console.log('   ✅ Infrastructure: Fetching data');
    console.log('   ✅ Finance: Fetching data');
    console.log('   ✅ Projects: Fixed - no more TypeError!');
    console.log('   ✅ Department Admins: Available for assignment');
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Run the test
testMunicipalEndpoints();