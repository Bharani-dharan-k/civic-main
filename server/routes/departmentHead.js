const express = require('express');
const router = express.Router();
const {
    getDashboardOverview,
    getTasks,
    createTask,
    updateTaskStatus,
    getStaff,
    createStaff,
    getResources,
    getProjects,
    getBudgetInfo,
    getComplaints,
    getPendingReports,
    getReportProgress
} = require('../controllers/departmentHeadController');
const { protect } = require('../middleware/authMiddleware');

// Dashboard overview
router.get('/dashboard', protect, getDashboardOverview);

// Tasks routes
router.get('/tasks', protect, getTasks);
router.post('/tasks', protect, createTask);
router.put('/tasks/:taskId/status', protect, updateTaskStatus);

// Staff routes
router.get('/staff', protect, getStaff);
router.post('/staff', protect, createStaff);

// Resources routes
router.get('/resources', protect, getResources);

// Projects routes
router.get('/projects', protect, getProjects);

// Budget routes
router.get('/budget', protect, getBudgetInfo);

// Complaints routes
router.get('/complaints', protect, getComplaints);

// Pending Reports for Task Assignment
router.get('/pending-reports', protect, getPendingReports);

// Report Progress Tracking
router.get('/report-progress', protect, getReportProgress);

module.exports = router;