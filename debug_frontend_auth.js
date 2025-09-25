// Debug frontend authentication status
console.log('🔍 Checking frontend authentication status...');

// Check localStorage contents
console.log('\n📱 localStorage contents:');
console.log('Token:', localStorage.getItem('token') ? 'EXISTS' : 'NOT FOUND');
console.log('User:', localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : 'NOT FOUND');

// Test the setSuperAdminAuth function manually
async function testAuth() {
  try {
    console.log('\n🔐 Testing authentication...');
    
    const response = await fetch('http://localhost:5000/api/auth/admin/login', {
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

    const data = await response.json();
    console.log('Auth response:', data);

    if (data.success) {
      console.log('✅ Authentication successful!');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('🎫 Token stored in localStorage!');
      
      // Now test creating a user
      const token = localStorage.getItem('token');
      console.log('\n👤 Testing user creation...');
      
      const createResponse = await fetch('http://localhost:5000/api/superadmin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'testpass123',
          role: 'district_admin',
          district: 'Test District'
        })
      });

      const createData = await createResponse.json();
      console.log('Create user response:', createData);
      
    } else {
      console.error('❌ Authentication failed:', data);
    }
  } catch (error) {
    console.error('❌ Auth error:', error);
  }
}

testAuth();