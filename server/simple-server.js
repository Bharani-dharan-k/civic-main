const express = require('express');
const cors = require('cors');
const multer = require('multer');

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
  res.json({ message: 'Simple server working!' });
});

// Real image classifier endpoint (calls actual API)
app.post('/api/image-classifier/analyze', upload.single('image'), async (req, res) => {
  console.log('Image classifier endpoint called');

  try {
    if (!req.file) {
      console.log('No file provided');
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('File received:', req.file.originalname, req.file.size, 'bytes');
    console.log('Calling real image classifier API...');

    // Create FormData for the external API call
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Call the real external image classifier API
    const response = await fetch('https://imageclassifier-wk4u.onrender.com/analyze', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log('External API response status:', response.status);

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);

      // Return a fallback response if API fails
      const fallbackResult = {
        "issue_type": "other",
        "severity": "medium",
        "confidence": 0.5,
        "description": "Unable to classify the image due to API issues. Please manually select the appropriate category.",
        "department": "General",
        "responsible": "Manual Review Required"
      };

      console.log('Returning fallback result due to API error');
      return res.json(fallbackResult);
    }

    const result = await response.json();
    console.log('Real API classification result:', result);

    // Return the actual result from the external API
    res.json(result);

  } catch (error) {
    console.error('Image classification error:', error);

    // Return a fallback response if there's an error
    const fallbackResult = {
      "issue_type": "other",
      "severity": "medium",
      "confidence": 0.5,
      "description": "Error occurred during image classification. Please manually select the appropriate category and description.",
      "department": "General",
      "responsible": "Manual Review Required"
    };

    console.log('Returning fallback result due to error:', error.message);
    res.json(fallbackResult);
  }
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log('📍 Routes available:');
  console.log('   GET /test');
  console.log('   POST /api/image-classifier/analyze');
  console.log('');
  console.log('✅ Server ready to receive requests!');
  console.log('🔄 This server will stay running - no crashes!');
});