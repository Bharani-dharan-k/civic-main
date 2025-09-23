const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';

async function run() {
  try {
    const login = await axios.post(`${BASE_URL}/auth/admin/login`, { email: 'bhupesh@gmail.com', password: '123456' });
    console.log('login:', login.data.user.name, login.data.user.role);
    const token = login.data.token;

    const resp = await axios.post(`${BASE_URL}/municipal/staff`, {
      name: 'Auto Test Staff',
      email: `autotest_${Date.now()}@example.com`,
      phone: '9999999999',
      role: 'field_staff',
      department: 'Sanitation'
    }, { headers: { Authorization: `Bearer ${token}` } });

    console.log('Add staff response:', resp.data);
  } catch (err) {
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

run();
