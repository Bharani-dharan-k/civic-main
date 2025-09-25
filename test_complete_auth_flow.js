// Complete authentication and user creation test
console.log('🔍 Starting comprehensive auth test...');

async function runFullTest() {
  try {
    // Step 1: Clear existing auth data
    console.log('\n🧹 Clearing existing auth data...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Step 2: Check initial state
    console.log('\n📱 Initial localStorage state:');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));
    
    // Step 3: Authenticate as super admin
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

    // Step 4: Store auth data
    console.log('\n💾 Storing auth data...');
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    
    // Step 5: Verify storage
    console.log('\n✅ Verifying stored data:');
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    console.log('Stored token:', storedToken ? 'EXISTS (length: ' + storedToken.length + ')' : 'NOT FOUND');
    console.log('Stored user:', storedUser ? JSON.parse(storedUser) : 'NOT FOUND');
    
    // Step 6: Test headers function
    console.log('\n📋 Testing auth headers:');
    const headers = {
      'Content-Type': 'application/json',
      ...(storedToken && { 'Authorization': `Bearer ${storedToken}` })
    };
    console.log('Headers:', headers);
    
    // Step 7: Test user creation
    console.log('\n👤 Testing user creation...');
    const createResponse = await fetch('http://localhost:5000/api/superadmin/create-admin', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        name: 'Debug Test User',
        email: 'debugtest@example.com',
        password: 'testpass123',
        role: 'district_admin',
        district: 'Debug District'
      })
    });

    console.log('Create response status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Create response data:', createData);

    if (createResponse.ok) {
      console.log('🎉 SUCCESS! User creation worked!');
    } else {
      console.error('❌ User creation failed:', createData);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

runFullTest();