const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Configure multer for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Test POST route without file upload
app.post('/api/test-post', (req, res) => {
  res.json({ message: 'POST route working' });
});

// Note: Image classifier is handled by separate service on port 5001
// See image-classifier-service.js

// Test route for debugging
app.post('/api/test/worker', (req, res) => {
    res.json({ message: 'Worker test route working', body: req.body });
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
console.log('Loading reports routes...');
try {
    app.use('/api/reports', require('./routes/reports'));
    console.log('Reports routes loaded successfully');
} catch (error) {
    console.error('Error loading reports routes:', error);
}
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/departments', require('./routes/departments'));
app.use('/api/worker', require('./routes/worker'));
app.use('/api/municipal', require('./routes/municipal'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/department-head', require('./routes/departmentHead'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Add process event handlers to prevent unexpected exits
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Keep the process alive
setInterval(() => {
    // Do nothing, just keep the process alive
}, 1000);