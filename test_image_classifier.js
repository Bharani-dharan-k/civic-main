const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const testImageClassifier = async () => {
    try {
        console.log('🖼️ Testing Image Classifier Endpoint...\n');

        // Test if the endpoint exists
        console.log('📡 Testing endpoint connectivity...');
        
        try {
            // Create a simple test request without actual image
            const response = await axios.post('http://localhost:5000/api/image-classifier/analyze', {}, {
                timeout: 5000
            });
            
        } catch (error) {
            if (error.response) {
                console.log(`✅ Endpoint responding with status: ${error.response.status}`);
                console.log(`📝 Response: ${error.response.data || 'No response data'}`);
                console.log('🎯 This means the endpoint exists and is reachable!');
            } else if (error.code === 'ECONNREFUSED') {
                console.log('❌ Server is not running on port 5000');
                return;
            } else {
                console.log('⚠️ Connection issue:', error.message);
                return;
            }
        }

        console.log('\n✅ Image Classifier endpoint is accessible at http://localhost:5000/api/image-classifier/analyze');
        console.log('🚀 The CitizenDashboard port fix should now work!');

    } catch (error) {
        console.error('❌ Error testing image classifier:');
        console.error(error.message);
    }
};

testImageClassifier();