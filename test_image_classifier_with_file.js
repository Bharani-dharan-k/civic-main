const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const testImageClassifierWithFile = async () => {
    try {
        console.log('🔍 Testing Image Classifier with actual file...\n');

        // Create a simple test image file (1x1 pixel PNG)
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);

        const formData = new FormData();
        formData.append('image', testImageBuffer, {
            filename: 'test.png',
            contentType: 'image/png'
        });

        console.log('📤 Sending test image to image classifier...');

        const response = await axios.post('http://localhost:5000/api/image-classifier/analyze', formData, {
            headers: {
                ...formData.getHeaders()
            },
            timeout: 10000
        });

        console.log('✅ Success!');
        console.log('📊 Response status:', response.status);
        console.log('📄 Response data:', response.data);

    } catch (error) {
        console.error('❌ Error testing image classifier:');
        console.error('Status:', error.response?.status);
        console.error('Status text:', error.response?.statusText);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        
        if (error.response?.data) {
            console.log('\n🔍 Server Error Details:');
            console.log(JSON.stringify(error.response.data, null, 2));
        }
    }
};

testImageClassifierWithFile();