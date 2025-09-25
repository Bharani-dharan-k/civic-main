// Test authentication and user creation flow without localStorage
const fetch = require('node-fetch');

console.log('🔍 Testing auth flow (backend only)...');

async function testAuthFlow() {
  try {
    // Step 1: Authenticate as super admin
    console.log('\n🔐 Authenticating as super admin...');
    const authResponse = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'bharani@gmail.com',
        password: '123456',
        role: 'super_admin'
      })
    });

    console.log('Auth response status:', authResponse.status);
    const authData = await authResponse.json();
    console.log('Auth response data:', authData);

    if (!authData.success) {
      console.error('❌ Authentication failed!');
      return;
    }

    const token = authData.token;
    console.log('✅ Got token:', token ? 'YES (length: ' + token.length + ')' : 'NO');

    // Step 2: Test user creation with the token
    console.log('\n👤 Testing user creation...');
    const createResponse = await fetch('http://localhost:5000/api/superadmin/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Backend Test User',
        email: 'backendtest@example.com',
        password: 'testpass123',
        role: 'district_admin',
        district: 'Backend Test District'
      })
    });

    console.log('Create response status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Create response data:', createData);

    if (createResponse.ok) {
      console.log('🎉 SUCCESS! Backend auth and user creation works!');
      console.log('\n🔍 This means the issue is in the frontend localStorage/token management');
    } else {
      console.error('❌ User creation failed even with valid backend auth');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAuthFlow();