
const express = require('express');
const router = express.Router();
const { 
    getMunicipalStats,
    getServiceRequests,
    getEmergencyAlerts,
    getMunicipalReports,
    getMunicipalStaff,
    updateReportStatus,
    getAssignedTasks,
    updateTaskProgress,
    getTaskStats,
    assignTask,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    getInfrastructureStatus,
    getFinanceData,
    getProjectsData,
    getDepartmentAdmins,
    assignReportToDepartmentAdmin
} = require('../controllers/municipalController');

const { protect, admin } = require('../middleware/authMiddleware');

// All municipal routes are protected and require admin role
router.use(protect, admin);

// Assign a task or report to staff
router.post('/assign-task', assignTask);

// Municipal dashboard routes
router.get('/stats', getMunicipalStats);
router.get('/service-requests', getServiceRequests);
router.get('/emergency-alerts', getEmergencyAlerts);
router.get('/reports', getMunicipalReports);
router.get('/staff', getMunicipalStaff);
router.get('/infrastructure', getInfrastructureStatus);
router.get('/finance', getFinanceData);
router.get('/projects', getProjectsData);
// Add staff member
router.post('/staff', addStaffMember);
// Update staff member
router.put('/staff/:staffId', updateStaffMember);
// Delete staff member
router.delete('/staff/:staffId', deleteStaffMember);

// Report management
router.put('/reports/:reportId/status', updateReportStatus);

// Task management routes
router.get('/tasks', getAssignedTasks);
router.get('/tasks/stats', getTaskStats);
router.put('/tasks/:taskId/progress', updateTaskProgress);

// Department admin management
router.get('/department-admins', getDepartmentAdmins);
router.post('/assign-report', assignReportToDepartmentAdmin);

module.exports = router;