const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Image classifier route is working!' });
});

// @route   POST /api/image-classifier/analyze
// @desc    Proxy endpoint for image classification
// @access  Public
router.post('/analyze', upload.single('image'), async (req, res) => {
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

module.exports = router;