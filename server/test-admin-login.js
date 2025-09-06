const axios = require('axios');

// Test admin login
async function testAdminLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bharani@gmail.com',
            password: 'bharani5544'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Login Success:', response.data);
    } catch (error) {
        console.log('❌ Login Failed:');
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);
        console.log('Request data:', error.config?.data);
    }
}

// Also test with hashed password admin
async function testHashedAdminLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'ashok@gmail.com',
            password: '123456'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Hashed Admin Login Success:', response.data);
    } catch (error) {
        console.log('❌ Hashed Admin Login Failed:');
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);
    }
}

console.log('Testing admin login...');
testAdminLogin();

setTimeout(() => {
    console.log('\nTesting hashed admin login...');
    testHashedAdminLogin();
}, 2000);
