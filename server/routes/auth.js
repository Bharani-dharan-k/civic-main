const express = require('express');
const router = express.Router();
const { 
    registerCitizen, 
    loginCitizen, 
    loginAdmin,
    loginWorker,
    getMe, 
    verifyToken,
    getProfile,
    updateProfile,
    getLeaderboard,
    getNotifications
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Debug middleware for all routes
router.use((req, res, next) => {
    console.log(`Route accessed: ${req.method} ${req.originalUrl} - Body:`, req.body);
    next();
});

// Citizen routes
router.post('/citizen/register', registerCitizen);
router.post('/citizen/login', loginCitizen);

// Admin routes
router.post('/admin/login', (req, res, next) => {
    console.log('*** ADMIN LOGIN ROUTE HIT ***', req.body);
    next();
}, loginAdmin);

// Worker routes
router.post('/worker/login', (req, res, next) => {
    console.log('*** WORKER LOGIN ROUTE HIT ***', req.body);
    next();
}, loginWorker);

// Common routes
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);

// Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Leaderboard and notifications
router.get('/leaderboard', getLeaderboard);
router.get('/notifications', protect, getNotifications);

// Legacy routes (for backward compatibility)
router.post('/register', registerCitizen);
router.post('/login', loginCitizen);


module.exports = router;