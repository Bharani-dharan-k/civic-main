const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Configure CORS to allow requests from your frontend
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Civic issue categories mapping
const CIVIC_CATEGORIES = {
  pothole: {
    keywords: ['hole', 'crack', 'damage', 'road', 'asphalt', 'pavement'],
    severity: 'high',
    priority: 'urgent'
  },
  garbage: {
    keywords: ['waste', 'trash', 'litter', 'dump', 'plastic', 'bottle'],
    severity: 'medium',
    priority: 'normal'
  },
  streetlight: {
    keywords: ['light', 'lamp', 'pole', 'electric', 'dark', 'broken'],
    severity: 'medium',
    priority: 'normal'
  },
  drainage: {
    keywords: ['water', 'drain', 'flood', 'pipe', 'sewer', 'block'],
    severity: 'high',
    priority: 'urgent'
  },
  maintenance: {
    keywords: ['repair', 'fix', 'broken', 'damage', 'worn'],
    severity: 'medium',
    priority: 'normal'
  }
};

// Simple image analysis based on filename and basic heuristics
function analyzeImageContent(filename, fileBuffer) {
  const analysis = {
    predicted_category: 'other',
    confidence: 0.3,
    detected_features: [],
    severity: 'medium',
    auto_fill_suggestions: {}
  };

  try {
    const fileName = filename.toLowerCase();
    let maxConfidence = 0;
    let detectedCategory = 'other';

    // Check filename for keywords
    Object.entries(CIVIC_CATEGORIES).forEach(([category, config]) => {
      const matchCount = config.keywords.filter(keyword => 
        fileName.includes(keyword)
      ).length;

      if (matchCount > 0) {
        const confidence = Math.min(0.9, 0.5 + (matchCount * 0.2));
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          detectedCategory = category;
          analysis.detected_features = config.keywords.filter(keyword => 
            fileName.includes(keyword)
          );
        }
      }
    });

    // Basic file size analysis (larger files might indicate more serious issues)
    const fileSizeKB = fileBuffer.length / 1024;
    if (fileSizeKB > 1000) { // Files larger than 1MB
      analysis.severity = 'high';
      maxConfidence += 0.1;
    }

    analysis.predicted_category = detectedCategory;
    analysis.confidence = Math.min(0.95, maxConfidence);

    // Generate auto-fill suggestions
    if (detectedCategory !== 'other') {
      const categoryConfig = CIVIC_CATEGORIES[detectedCategory];
      analysis.auto_fill_suggestions = {
        category: detectedCategory,
        priority: categoryConfig.priority,
        severity: categoryConfig.severity,
        title: `${detectedCategory.charAt(0).toUpperCase() + detectedCategory.slice(1)} Issue Detected`,
        description: `Auto-detected ${detectedCategory} issue. Please verify and add more details.`
      };
    }

    return analysis;
  } catch (error) {
    console.error('Error in image analysis:', error);
    return analysis;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'civic-image-classifier',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Main image analysis endpoint
app.post('/api/image-classifier/analyze', upload.single('image'), async (req, res) => {
  try {
    console.log('📸 Image classification request received');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const { originalname, filename, path: filepath, size } = req.file;
    console.log(`Analyzing image: ${originalname} (${(size/1024).toFixed(2)}KB)`);

    // Read file buffer for analysis
    const fileBuffer = fs.readFileSync(filepath);

    // Perform analysis
    const analysis = analyzeImageContent(originalname, fileBuffer);

    // Clean up uploaded file
    fs.unlinkSync(filepath);

    console.log(`✅ Analysis complete: ${analysis.predicted_category} (${(analysis.confidence * 100).toFixed(1)}% confidence)`);

    // Return analysis results
    const response = {
      success: true,
      // Format expected by CitizenDashboard.jsx
      issue_type: analysis.predicted_category,
      description: `Auto-detected ${analysis.predicted_category.replace('_', ' ')} issue. ${analysis.detected_features.length > 0 ? `Features detected: ${analysis.detected_features.join(', ')}.` : ''} Please verify and add more details.`,
      confidence: analysis.confidence,
      severity: analysis.severity,
      // Additional analysis data
      analysis: {
        predicted_category: analysis.predicted_category,
        confidence: analysis.confidence,
        detected_features: analysis.detected_features,
        severity: analysis.severity,
        auto_fill_suggestions: analysis.auto_fill_suggestions,
        recommendations: getRecommendations(analysis.predicted_category)
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Error in image analysis:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error during image analysis'
    });
  }
});

// Get available categories
app.get('/api/image-classifier/categories', (req, res) => {
  res.json({
    success: true,
    categories: Object.keys(CIVIC_CATEGORIES)
  });
});

// Get recommendations based on category
function getRecommendations(category) {
  const recommendations = {
    pothole: [
      'Mark the area for safety',
      'Avoid parking or stopping over the pothole',
      'Report exact location and size',
      'Check if multiple potholes are nearby'
    ],
    garbage: [
      'Do not add more waste to the pile',
      'Report if waste is blocking drainage',
      'Specify if hazardous materials are present',
      'Note if regular collection is needed'
    ],
    streetlight: [
      'Report exact pole number if visible',
      'Note if multiple lights are affected',
      'Specify if area becomes unsafe after dark',
      'Check for exposed wiring'
    ],
    drainage: [
      'Clear small blockages if safe to do so',
      'Report if sewage is backing up',
      'Avoid contact with standing water',
      'Check for flood risk during rain'
    ],
    maintenance: [
      'Provide clear description of the issue',
      'Note if issue affects public safety',
      'Report if situation is worsening',
      'Include any temporary fixes attempted'
    ]
  };

  return recommendations[category] || [
    'Provide clear description of the issue',
    'Include location details',
    'Report if situation is worsening',
    'Add any relevant safety concerns'
  ];
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const PORT = process.env.IMAGE_CLASSIFIER_PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🔍 Image Classifier Service started on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Analysis endpoint: http://localhost:${PORT}/api/image-classifier/analyze`);
});

// Keep the process alive
const keepAlive = setInterval(() => {
  // This prevents the process from exiting
}, 60000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Image Classifier Service shutting down...');
  clearInterval(keepAlive);
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Image Classifier Service shutting down...');
  clearInterval(keepAlive);
  server.close(() => {
    process.exit(0);
  });
});