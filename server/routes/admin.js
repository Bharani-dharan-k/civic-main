const express = require('express');
const router = express.Router();
const { 
    getStats, 
    assignWorkerToReport, 
    getLeaderboard, 
    getAllReports, 
    updateReportStatus, 
    getAnalytics 
} = require('../controllers/adminController');
const { getActiveWorkers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes are protected and require admin role
router.use(protect, admin);

router.get('/stats', getStats);
router.get('/leaderboard', getLeaderboard);
router.get('/reports', getAllReports);
router.get('/analytics', getAnalytics);
router.get('/workers/active', getActiveWorkers);
router.put('/reports/:id/assign', assignWorkerToReport);
router.put('/reports/:id/status', updateReportStatus);

module.exports = router;