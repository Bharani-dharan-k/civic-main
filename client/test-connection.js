// Simple Node.js script to test backend connectivity
const http = require('http');

console.log('Testing connection to backend...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend is reachable! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ Connection failed:', err.message);
  console.error('Error code:', err.code);
  console.error('Error details:', err);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Connection timeout');
  req.destroy();
  process.exit(1);
});

req.setTimeout(5000);
req.end();