const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Civic Platform Development Environment...\n');

// Start main server
const mainServer = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe']
});

// Start image classifier service  
const imageClassifier = spawn('node', ['image-classifier-service.js'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe']
});

// Handle main server output
mainServer.stdout.on('data', (data) => {
  process.stdout.write(`[MAIN] ${data}`);
});

mainServer.stderr.on('data', (data) => {
  process.stderr.write(`[MAIN] ${data}`);
});

// Handle image classifier output
imageClassifier.stdout.on('data', (data) => {
  process.stdout.write(`[CLASSIFIER] ${data}`);
});

imageClassifier.stderr.on('data', (data) => {
  process.stderr.write(`[CLASSIFIER] ${data}`);
});

// Handle process exits
mainServer.on('close', (code) => {
  console.log(`[MAIN] Server exited with code ${code}`);
  if (code !== 0) {
    imageClassifier.kill();
    process.exit(1);
  }
});

imageClassifier.on('close', (code) => {
  console.log(`[CLASSIFIER] Image classifier exited with code ${code}`);
  if (code !== 0) {
    mainServer.kill();
    process.exit(1);
  }
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down development environment...');
  mainServer.kill();
  imageClassifier.kill();
  process.exit(0);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down development environment...');
  mainServer.kill();
  imageClassifier.kill();
  process.exit(0);
});

console.log('✅ Both services starting...');
console.log('📊 Main Server: http://localhost:5000');
console.log('🔍 Image Classifier: http://localhost:5001');
console.log('Press Ctrl+C to stop all services\n');