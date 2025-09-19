const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

// Apply protection and super admin check to all routes
router.use(protect);
router.use(superAdminOnly);

// User Management Routes
router.post('/create-admin', superAdminController.createAdmin);
router.get('/all-users', superAdminController.getAllUsers);
router.put('/update-user/:id', superAdminController.updateUser);
router.delete('/delete-user/:id', superAdminController.deleteUser);

// Report Management Routes
router.get('/reports', superAdminController.getAllReports);
router.delete('/reports/:id', superAdminController.deleteReport);

// Analytics Routes
router.get('/analytics', superAdminController.getAnalytics);

// Category Management Routes
router.post('/categories', superAdminController.createCategory);
router.get('/categories', superAdminController.getCategories);
router.put('/categories/:id', superAdminController.updateCategory);
router.delete('/categories/:id', superAdminController.deleteCategory);

// District Head Management Routes
router.get('/district-heads', superAdminController.getDistrictHeads);
router.post('/district-heads', superAdminController.createDistrictHead);
router.put('/district-heads/:id', superAdminController.updateDistrictHead);
router.delete('/district-heads/:id', superAdminController.deleteDistrictHead);

module.exports = router;