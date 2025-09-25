// Test to debug the authentication issue with create admin

// Check if frontend server is running
async function checkFrontendAuth() {
  try {
    // Simulate frontend authentication check
    const token = 'fake_token'; // This would come from localStorage in real frontend
    
    console.log('🔍 Testing frontend authentication flow...');
    
    // Test the endpoint that frontend is calling
    const response = await fetch('http://localhost:5000/api/superadmin/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
        role: 'district_admin',
        district: 'Test District'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response content type:', response.headers.get('content-type'));
    
    const responseText = await response.text();
    console.log('Response text (first 200 chars):', responseText.substring(0, 200));
    
    if (responseText.includes('<!DOCTYPE')) {
      console.log('\n❌ SERVER RETURNED HTML INSTEAD OF JSON!');
      console.log('This indicates authentication middleware is redirecting to error page');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test with valid super admin token
async function testWithValidToken() {
  try {
    console.log('\n🔑 Getting valid super admin token...');
    
    // Get valid token
    const loginResponse = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bharani@gmail.com',
        password: '123456',
        role: 'super_admin'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Got valid token');
    
    // Test create admin with valid token
    const response = await fetch('http://localhost:5000/api/superadmin/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test User Valid',
        email: 'testvalid@example.com',
        password: '123456',
        role: 'district_admin',
        district: 'Test District'
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success with valid token!');
      console.log('Created user:', data.user?.name);
    } else {
      const errorText = await response.text();
      console.log('❌ Failed even with valid token');
      console.log('Error:', errorText.substring(0, 200));
    }
    
  } catch (error) {
    console.error('Error with valid token test:', error.message);
  }
}

// Run tests
async function runTests() {
  await checkFrontendAuth();
  await testWithValidToken();
}

runTests();