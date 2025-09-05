const Department = require('../models/Department');
const Report = require('../models/Report');

// @desc    Get all departments
// @route   GET /api/admin/departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true }).sort({ name: 1 });
        
        // Get issue counts for each department
        const departmentsWithCounts = await Promise.all(
            departments.map(async (dept) => {
                const activeCount = await Report.countDocuments({
                    assignedDepartment: dept.name,
                    status: { $in: ['assigned', 'in_progress'] }
                });
                
                const resolvedCount = await Report.countDocuments({
                    assignedDepartment: dept.name,
                    status: 'resolved'
                });

                return {
                    ...dept.toObject(),
                    activeIssues: activeCount,
                    resolvedIssues: resolvedCount
                };
            })
        );

        res.json({
            success: true,
            departments: departmentsWithCounts
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching departments'
        });
    }
};

// @desc    Create a new department
// @route   POST /api/admin/departments
exports.createDepartment = async (req, res) => {
    try {
        const { name, description, head, contact, email, icon, color } = req.body;

        // Check if department already exists
        const existingDepartment = await Department.findOne({ name });
        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists'
            });
        }

        const department = new Department({
            name,
            description,
            head,
            contact,
            email,
            icon,
            color
        });

        await department.save();

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            department: {
                ...department.toObject(),
                activeIssues: 0,
                resolvedIssues: 0
            }
        });
    } catch (error) {
        console.error('Error creating department:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists'
            });
        }
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating department'
        });
    }
};

// @desc    Update a department
// @route   PUT /api/admin/departments/:id
exports.updateDepartment = async (req, res) => {
    try {
        const { name, description, head, contact, email, icon, color } = req.body;
        const departmentId = req.params.id;

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if name is being changed and if new name already exists
        if (name !== department.name) {
            const existingDepartment = await Department.findOne({ name, _id: { $ne: departmentId } });
            if (existingDepartment) {
                return res.status(400).json({
                    success: false,
                    message: 'Department with this name already exists'
                });
            }
        }

        const oldName = department.name;

        // Update department fields
        department.name = name;
        department.description = description;
        department.head = head;
        department.contact = contact;
        department.email = email;
        department.icon = icon;
        department.color = color;

        await department.save();

        // Update all reports that were assigned to the old department name
        if (oldName !== name) {
            await Report.updateMany(
                { assignedDepartment: oldName },
                { assignedDepartment: name }
            );
        }

        // Get updated counts
        const activeCount = await Report.countDocuments({
            assignedDepartment: department.name,
            status: { $in: ['assigned', 'in_progress'] }
        });
        
        const resolvedCount = await Report.countDocuments({
            assignedDepartment: department.name,
            status: 'resolved'
        });

        res.json({
            success: true,
            message: 'Department updated successfully',
            department: {
                ...department.toObject(),
                activeIssues: activeCount,
                resolvedIssues: resolvedCount
            }
        });
    } catch (error) {
        console.error('Error updating department:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating department'
        });
    }
};

// @desc    Delete a department
// @route   DELETE /api/admin/departments/:id
exports.deleteDepartment = async (req, res) => {
    try {
        const departmentId = req.params.id;

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if department has active reports
        const activeReports = await Report.countDocuments({
            assignedDepartment: department.name,
            status: { $in: ['assigned', 'in_progress'] }
        });

        if (activeReports > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete department. It has ${activeReports} active reports assigned to it.`
            });
        }

        // Soft delete - mark as inactive instead of actually deleting
        department.isActive = false;
        await department.save();

        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting department'
        });
    }
};

// @desc    Get department statistics
// @route   GET /api/admin/departments/:id/stats
exports.getDepartmentStats = async (req, res) => {
    try {
        const departmentId = req.params.id;

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Get detailed statistics
        const stats = await Report.aggregate([
            { $match: { assignedDepartment: department.name } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyTrends = await Report.aggregate([
            { 
                $match: { 
                    assignedDepartment: department.name,
                    createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
                } 
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            success: true,
            department,
            stats,
            monthlyTrends
        });
    } catch (error) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching department statistics'
        });
    }
};
