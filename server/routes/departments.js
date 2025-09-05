const express = require('express');
const router = express.Router();
const {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentStats
} = require('../controllers/departmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// All department routes are protected and require admin role
router.use(protect, admin);

// Department CRUD routes
router.get('/', getAllDepartments);
router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);
router.get('/:id/stats', getDepartmentStats);

module.exports = router;
