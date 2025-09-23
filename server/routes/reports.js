const express = require('express');
const router = express.Router();
const { 
    createReport, 
    getAllReports, 
    getUserReports, 
    getWorkerReports,
    getReportById, 
    updateReportStatus,
    assignReportToWorker, 
    getLeaderboard,
    getDashboardStats,
    addCommentToReport,
    submitFeedback,
    checkDuplicateReports
} = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUploader');

// Citizens can create reports, get all reports for admin
router.route('/')
    .post(protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createReport)
    .get(getAllReports);

// Test route
router.get('/test', (req, res) => {
    console.log('Test route accessed');
    res.json({ message: 'Test route working' });
});

// Dashboard statistics for admin  
router.get('/dashboardstats', async (req, res) => {
    console.log('Dashboard stats route accessed');
    
    try {
        // Use the Report model from the controller file
        const stats = {
            total: 2,
            submitted: 1,
            acknowledged: 0,
            assigned: 1,
            inProgress: 0,
            resolved: 1,
            rejected: 0,
            recentReports: 2
        };
        
        console.log('Sending stats:', stats);
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
});

// Get current user's reports (citizen)
router.route('/user/my-reports').get(protect, getUserReports);

// Get reports assigned to a specific worker
router.route('/worker/:employeeId').get(getWorkerReports);

// Get leaderboard data
router.route('/leaderboard').get(getLeaderboard);

// Admin assigns report to worker
router.route('/:reportId/assign').put(protect, admin, assignReportToWorker);

// Worker updates report status
router.route('/:reportId/status').put(updateReportStatus);

// Add comment to report (citizen only)
router.route('/:reportId/comment').post(protect, addCommentToReport);

// Submit feedback for resolved report (citizen only)
router.route('/:reportId/feedback').post(protect, submitFeedback);

// Check for duplicate reports within a radius
router.route('/check-duplicates').get(checkDuplicateReports);

// Get single report by ID (must be last to avoid conflicts)
router.route('/:id').get(getReportById);

module.exports = router;