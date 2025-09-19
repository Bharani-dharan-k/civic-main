const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
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

// Image classifier proxy route
app.post('/api/image-classifier/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Create FormData for the external API call
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Call the external image classifier API
    const response = await fetch('https://imageclassifier-wk4u.onrender.com/analyze', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return res.status(500).json({
        message: 'Image classification service unavailable',
        error: response.statusText
      });
    }

    const result = await response.json();
    console.log('Image classification result:', result);

    // Return the result from the external API
    res.json(result);

  } catch (error) {
    console.error('Image classification error:', error);
    res.status(500).json({
      message: 'Error processing image classification',
      error: error.message
    });
  }
});

console.log('Image classifier route loaded directly in server.js');

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