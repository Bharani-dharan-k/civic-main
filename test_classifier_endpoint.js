const http = require('http');
const fs = require('fs');

// Create test image data (simple text file as placeholder)
const testImageData = 'fake image data for testing';

// Create form data boundary
const boundary = '----formdata-boundary-' + Math.random().toString(36);
const delimiter = `\r\n--${boundary}\r\n`;
const close_delimiter = `\r\n--${boundary}--`;

// Build the form data
let data = '';
data += delimiter;
data += 'Content-Disposition: form-data; name="image"; filename="test.jpg"\r\n';
data += 'Content-Type: image/jpeg\r\n\r\n';
data += testImageData;
data += close_delimiter;

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/image-classifier/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
    if (res.statusCode === 200) {
      console.log('✅ Image classifier working successfully!');
    } else {
      console.log('❌ Image classifier error');
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(data);
req.end();