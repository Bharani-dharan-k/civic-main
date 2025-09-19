const axios = require('axios');

const testMunicipalityAdminCreation = async () => {
  try {
    console.log('🔄 Testing Municipality Admin Creation...\n');

    // First, login as district admin to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'dilshan@gmail.com', // Using real district admin with ObjectId
      password: '123456' // The correct password
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response data:', loginResponse.data);

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    console.log('✅ Login successful');
    const token = loginResponse.data.token;

    // Test municipality admin creation
    const municipalityAdminData = {
      name: 'Test Municipality Admin',
      email: 'test.municipality.admin@example.com',
      password: 'password123',
      role: 'municipality_admin',
      municipality: 'Test Municipality',
      district: 'Bokaro District',
      phone: '+91-9876543210'
    };

    console.log('🔄 Creating municipality admin with data:');
    console.log(municipalityAdminData);

    const response = await axios.post('http://localhost:5000/api/admin/users', municipalityAdminData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n📈 Response Status:', response.status);
    console.log('📊 Response Data:', response.data);

    if (response.data.success) {
      console.log('✅ Municipality Admin created successfully!');
      console.log('📧 Email:', municipalityAdminData.email);
      console.log('🏛️ Municipality:', municipalityAdminData.municipality);
      console.log('📍 District:', municipalityAdminData.district);
    } else {
      console.log('❌ Failed to create municipality admin:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Error testing municipality admin creation:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
};

testMunicipalityAdminCreation();