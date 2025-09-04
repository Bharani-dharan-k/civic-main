const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
    getAssignedTasks, 
    updateTaskStatus, 
    uploadTaskPhotos, 
    getWorkerStats,
    getTaskDetails
} = require('../controllers/workerController');
const { protect, worker } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/worker/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + file.originalname.split('.').pop())
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed'));
        }
    }
});

// All worker routes are protected and require worker role
router.use(protect, worker);

// Task management routes
router.get('/tasks', getAssignedTasks);
router.get('/tasks/:id', getTaskDetails);
router.put('/tasks/:id/status', updateTaskStatus);
router.post('/tasks/:id/photos', upload.array('photos', 5), uploadTaskPhotos);

// Worker statistics
router.get('/stats', getWorkerStats);

module.exports = router;