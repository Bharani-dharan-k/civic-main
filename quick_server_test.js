const axios = require('axios');

const quickServerTest = async () => {
    try {
        console.log('🧪 Testing server connectivity...');
        
        // Test if server is running
        const response = await axios.get('http://localhost:5000/api/health', {
            timeout: 5000
        });
        
        console.log('✅ Server is running:', response.status);
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running on port 5000');
            console.log('👉 Please start the server with: cd server && npm start');
        } else {
            console.log('❌ Server error:', error.message);
        }
    }
};

quickServerTest();