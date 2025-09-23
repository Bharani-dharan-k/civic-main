const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';
(async ()=>{
  try{
    const login = await axios.post(`${BASE_URL}/auth/admin/login`, { email: 'bhupesh@gmail.com', password: '123456' });
    const token = login.data.token;
    const me = await axios.get(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('me.data', me.data);
  }catch(e){
    console.error(e.response?e.response.data:e.message);
  }
})();
