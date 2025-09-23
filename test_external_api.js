const https = require('https');

console.log('Testing external API connectivity...');

const options = {
  hostname: 'imageclassifier-wk4u.onrender.com',
  port: 443,
  path: '/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data.substring(0, 200));
    if (res.statusCode === 200) {
      console.log('✅ External API is accessible');
    } else {
      console.log('❌ External API returned error status');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ External API connection error:', e.message);
});

req.setTimeout(10000, () => {
  console.error('❌ External API timeout');
  req.destroy();
});

req.end();