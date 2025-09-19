const express = require('express');
const router = express.Router();
const { 
    getStats, 
    assignWorkerToReport, 
    getLeaderboard, 
    getAllReports, 
    updateReportStatus, 
    getAnalytics,
    exportAnalyticsReport,
    assignDepartmentToReport,
    updateReport,
    deleteReport,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getProfile,
    updateProfile,
    changePassword,
    getNotificationSettings,
    updateNotificationSettings,
    getSystemSettings,
    updateSystemSettings,
    getDistrictUsers,
    createDepartmentAdmin,
    updateDepartmentAdmin,
    deleteDepartmentAdmin,
    resetUserPassword,
    getStaffData,
    addStaffMember,
    assignTask,
    getTasks,
    getInfrastructureStatus,
    getFinanceData,
    getProjectsData,
    getEmergencyAlerts,
    getServiceRequests
} = require('../controllers/adminController');
const { getActiveWorkers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes are protected and require admin role
router.use(protect, admin);

// Dashboard and Analytics routes
router.get('/stats', getStats);
router.get('/leaderboard', getLeaderboard);
router.get('/reports', getAllReports);
router.get('/analytics', getAnalytics);
router.get('/analytics/export', exportAnalyticsReport);
router.get('/workers/active', getActiveWorkers);

// Municipal Dashboard routes
router.get('/staff', getStaffData);
router.post('/staff', addStaffMember);
router.post('/tasks', assignTask);
router.get('/tasks', getTasks);
router.get('/infrastructure', getInfrastructureStatus);
router.get('/finance', getFinanceData);
router.get('/projects', getProjectsData);
router.get('/emergency-alerts', getEmergencyAlerts);
router.get('/service-requests', getServiceRequests);

// Report management routes
router.put('/reports/:id/assign', assignWorkerToReport);
router.put('/reports/:id/status', updateReportStatus);
router.put('/reports/:id/assign-department', assignDepartmentToReport);
router.put('/reports/:id', updateReport);
router.delete('/reports/:id', deleteReport);

// Notification routes
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/mark-all-read', markAllNotificationsRead);

// Settings routes
router.get('/settings/profile', getProfile);
router.put('/settings/profile', updateProfile);
router.put('/settings/password', changePassword);
router.get('/settings/notifications', getNotificationSettings);
router.put('/settings/notifications', updateNotificationSettings);
router.get('/settings/system', getSystemSettings);
router.put('/settings/system', updateSystemSettings);

// User management routes
router.get('/users', getDistrictUsers);
router.post('/users', createDepartmentAdmin);
router.put('/users/:id', updateDepartmentAdmin);
router.delete('/users/:id', deleteDepartmentAdmin);
router.put('/users/:id/reset-password', resetUserPassword);

module.exports = router;