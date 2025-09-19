const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const multer = require('multer');
const FormData = require('form-data');
// Node.js v22 has built-in fetch

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test server working!' });
});

// Image classifier proxy route
app.post('/api/image-classifier/analyze', upload.single('image'), async (req, res) => {
  console.log('Image classifier endpoint called');

  try {
    if (!req.file) {
      console.log('No file provided');
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('File received:', req.file.originalname, req.file.size, 'bytes');

    // Create FormData for the external API call
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    console.log('Calling external API...');

    // Call the external image classifier API
    const response = await fetch('https://imageclassifier-wk4u.onrender.com/analyze', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log('External API response status:', response.status);

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

const PORT = 5001; // Use different port to avoid conflicts

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Routes available:');
  console.log('  GET /test');
  console.log('  POST /api/image-classifier/analyze');
=======

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Simple test endpoint for citizen login
app.post('/api/auth/citizen/login', (req, res) => {
    console.log('*** CITIZEN LOGIN REQUEST RECEIVED ***');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            msg: 'Email and password are required' 
        });
    }
    
    // Mock successful login for testing
    if (email === 'rajesh@example.com' && password === 'password123') {
        const mockToken = 'mock_jwt_token_12345';
        const mockUser = {
            _id: 'mock_user_id',
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            role: 'citizen',
            points: 2450
        };
        
        console.log('✅ Login successful for:', mockUser.name);
        return res.json({ 
            success: true,
            msg: 'Login successful',
            token: mockToken,
            user: mockUser
        });
    }
    
    return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials' 
    });
});

// Test endpoint
app.get('/api/auth/test', (req, res) => {
    res.json({ success: true, message: 'Test endpoint working!' });
});

const PORT = 5002;

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Test server started on http://127.0.0.1:${PORT}`);
    console.log('MongoDB connection disabled for testing');
>>>>>>> 11cb97abbb725d33e1e5bb1e198dab756353f5ce
});