const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Report = require('../models/Report');
const Category = require('../models/Category');

// User Management Functions

// Create new admin (District Admin, Municipality Admin, etc.)
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password, role, district, municipality, department } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, and role are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Validate role
        const allowedRoles = ['district_admin', 'municipality_admin', 'department_head', 'field_head', 'field_staff'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Create new user
        const userData = {
            name,
            email,
            password,
            role,
            adminRole: role,
            createdBy: req.user.id
        };

        // Add location fields based on role
        if (['district_admin', 'municipality_admin', 'department_head', 'field_head', 'field_staff'].includes(role)) {
            if (!district) {
                return res.status(400).json({
                    success: false,
                    message: 'District is required for this role'
                });
            }
            userData.district = district;
        }

        if (['municipality_admin', 'department_head', 'field_head', 'field_staff'].includes(role)) {
            if (!municipality) {
                return res.status(400).json({
                    success: false,
                    message: 'Municipality is required for this role'
                });
            }
            userData.municipality = municipality;
        }

        if (['department_head', 'field_head', 'field_staff'].includes(role)) {
            if (!department) {
                return res.status(400).json({
                    success: false,
                    message: 'Department is required for this role'
                });
            }
            userData.department = department;
        }

        const newUser = new User(userData);
        await newUser.save();

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: `${role.replace('_', ' ')} created successfully`,
            user: userResponse
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating admin',
            error: error.message
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, district, municipality, department } = req.query;
        
        // Build filter
        const filter = {};
        if (role) filter.role = role;
        if (district) filter.district = district;
        if (municipality) filter.municipality = municipality;
        if (department) filter.department = department;

        const users = await User.find(filter)
            .select('-password')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(filter);

        res.json({
            success: true,
            users,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users',
            error: error.message
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove password from updates if it's empty
        if (updates.password === '') {
            delete updates.password;
        }

        // If password is being updated, hash it
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user',
            error: error.message
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deletion of super admin
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (userToDelete.role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete super admin'
            });
        }

        await User.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user',
            error: error.message
        });
    }
};

// Report Management Functions

// Get all reports with filters
exports.getAllReports = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            district, 
            municipality, 
            department, 
            category, 
            status,
            priority,
            dateFrom,
            dateTo
        } = req.query;

        // Build filter
        const filter = {};
        if (district) filter.district = district;
        if (municipality) filter.municipality = municipality;
        if (department) filter.department = department;
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        
        // Date filter
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) filter.createdAt.$lte = new Date(dateTo);
        }

        const reports = await Report.find(filter)
            .populate('reportedBy', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Report.countDocuments(filter);

        res.json({
            success: true,
            reports,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get all reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reports',
            error: error.message
        });
    }
};

// Delete report
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedReport = await Report.findByIdAndDelete(id);

        if (!deletedReport) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });

    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting report',
            error: error.message
        });
    }
};

// Analytics Functions

// Get system-wide analytics
exports.getAnalytics = async (req, res) => {
    try {
        // Total reports
        const totalReports = await Report.countDocuments();
        
        // Reports by status
        const reportsByStatus = await Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Reports by priority
        const reportsByPriority = await Report.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        // Reports by category
        const reportsByCategory = await Report.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Reports by district
        const reportsByDistrict = await Report.aggregate([
            { $group: { _id: '$district', count: { $sum: 1 } } }
        ]);

        // Reports by municipality
        const reportsByMunicipality = await Report.aggregate([
            { $group: { _id: '$municipality', count: { $sum: 1 } } }
        ]);

        // Average resolution time for resolved reports
        const resolvedReports = await Report.find({ 
            status: 'resolved',
            resolvedAt: { $exists: true }
        });

        let avgResolutionTime = 0;
        if (resolvedReports.length > 0) {
            const totalTime = resolvedReports.reduce((total, report) => {
                const timeToResolve = new Date(report.resolvedAt) - new Date(report.createdAt);
                return total + timeToResolve;
            }, 0);
            avgResolutionTime = Math.round(totalTime / resolvedReports.length / (1000 * 60 * 60 * 24)); // in days
        }

        // Recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentReports = await Report.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // User counts by role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            analytics: {
                totalReports,
                recentReports,
                avgResolutionTime,
                reportsByStatus: reportsByStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                reportsByPriority: reportsByPriority.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                reportsByCategory: reportsByCategory.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                reportsByDistrict: reportsByDistrict.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                reportsByMunicipality: reportsByMunicipality.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                usersByRole: usersByRole.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching analytics',
            error: error.message
        });
    }
};

// Category Management Functions

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, priority, color, keywords } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Name and description are required'
            });
        }

        const newCategory = new Category({
            name,
            description,
            priority: priority || 'medium',
            color: color || '#3B82F6',
            keywords: keywords || [],
            createdBy: req.user.id
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category: newCategory
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating category',
            error: error.message
        });
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const { isActive = true } = req.query;
        
        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const categories = await Category.find(filter)
            .populate('createdBy', 'name email')
            .sort({ name: 1 });

        res.json({
            success: true,
            categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories',
            error: error.message
        });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully',
            category: updatedCategory
        });

    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating category',
            error: error.message
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category is being used in any reports
        const reportsUsingCategory = await Report.countDocuments({ category: id });
        
        if (reportsUsingCategory > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It is being used in ${reportsUsingCategory} report(s)`
            });
        }

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });

    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting category',
            error: error.message
        });
    }
};

// Get comprehensive analytics data
exports.getAnalytics = async (req, res) => {
    try {
        // Basic statistics
        const totalReports = await Report.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalCitizens = await User.countDocuments({ role: 'citizen' });
        const totalWorkers = await User.countDocuments({ role: 'worker' });
        const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'super_admin'] } });
        
        // Report status distribution
        const statusDistribution = await Report.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        // Reports by category
        const categoryDistribution = await Report.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    category: '$_id',
                    count: 1,
                    resolved: 1,
                    resolutionRate: {
                        $multiply: [
                            { $divide: ['$resolved', '$count'] },
                            100
                        ]
                    },
                    _id: 0
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Monthly trends for the last 12 months
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const monthlyTrends = await Report.aggregate([
            {
                $match: {
                    createdAt: { $gte: oneYearAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalReports: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
                        }
                    },
                    inProgress: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0]
                        }
                    },
                    submitted: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            },
            {
                $project: {
                    year: '$_id.year',
                    month: '$_id.month',
                    totalReports: 1,
                    resolved: 1,
                    inProgress: 1,
                    submitted: 1,
                    _id: 0
                }
            }
        ]);

        // Priority distribution
        const priorityDistribution = await Report.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    priority: { $ifNull: ['$_id', 'Medium'] },
                    count: 1,
                    _id: 0
                }
            }
        ]);

        // Average resolution time calculation
        const resolutionTimeStats = await Report.aggregate([
            {
                $match: {
                    status: 'resolved',
                    resolvedAt: { $exists: true },
                    createdAt: { $exists: true }
                }
            },
            {
                $project: {
                    resolutionTimeHours: {
                        $divide: [
                            { $subtract: ['$resolvedAt', '$createdAt'] },
                            1000 * 60 * 60
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    averageHours: { $avg: '$resolutionTimeHours' },
                    minHours: { $min: '$resolutionTimeHours' },
                    maxHours: { $max: '$resolutionTimeHours' },
                    totalResolved: { $sum: 1 }
                }
            }
        ]);

        // Recent activity (last 7 days)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const recentActivity = {
            newReports: await Report.countDocuments({ 
                createdAt: { $gte: lastWeek }
            }),
            resolvedReports: await Report.countDocuments({ 
                status: 'resolved',
                resolvedAt: { $gte: lastWeek }
            }),
            newUsers: await User.countDocuments({ 
                createdAt: { $gte: lastWeek }
            })
        };

        // Geographic distribution (top locations)
        const geographicDistribution = await Report.aggregate([
            {
                $match: {
                    'location.address': { $exists: true, $ne: '' }
                }
            },
            {
                $group: {
                    _id: '$location.address',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    location: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // User activity stats
        const userActivityStats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    active: {
                        $sum: {
                            $cond: [
                                { $gte: ['$lastLogin', lastWeek] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    role: '$_id',
                    total: '$count',
                    activeLastWeek: '$active',
                    activityRate: {
                        $multiply: [
                            { $divide: ['$active', '$count'] },
                            100
                        ]
                    },
                    _id: 0
                }
            }
        ]);

        // Performance metrics
        const performanceMetrics = {
            totalReports,
            resolvedReports: await Report.countDocuments({ status: 'resolved' }),
            pendingReports: await Report.countDocuments({ 
                status: { $in: ['submitted', 'acknowledged', 'assigned', 'in_progress'] }
            }),
            overallResolutionRate: totalReports > 0 ? 
                ((await Report.countDocuments({ status: 'resolved' }) / totalReports) * 100) : 0
        };

        res.json({
            success: true,
            data: {
                overview: {
                    totalReports,
                    totalUsers,
                    totalCitizens,
                    totalWorkers,
                    totalAdmins
                },
                statusDistribution,
                categoryDistribution,
                priorityDistribution,
                monthlyTrends,
                resolutionTimeStats: resolutionTimeStats[0] || {
                    averageHours: 0,
                    minHours: 0,
                    maxHours: 0,
                    totalResolved: 0
                },
                recentActivity,
                geographicDistribution,
                userActivityStats,
                performanceMetrics
            }
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching analytics',
            error: error.message
        });
    }
};

// District Head Management Functions

// Get all district heads
exports.getDistrictHeads = async (req, res) => {
    try {
        const districtHeads = await User.find({ 
            role: 'district_admin' 
        }).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            data: districtHeads.map(head => ({
                _id: head._id,
                districtName: head.district,
                email: head.email,
                name: head.name,
                isActive: head.isActive !== false,
                createdAt: head.createdAt,
                role: head.role
            }))
        });
    } catch (error) {
        console.error('Get district heads error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching district heads',
            error: error.message
        });
    }
};

// Create new district head
exports.createDistrictHead = async (req, res) => {
    try {
        console.log('Creating district head with data:', req.body);
        const { districtName, email, password } = req.body;

        // Validate required fields
        if (!districtName || !email || !password) {
            console.log('Validation failed: missing required fields');
            return res.status(400).json({
                success: false,
                message: 'District name, email, and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Validation failed: invalid email format');
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password length
        if (password.length < 6) {
            console.log('Validation failed: password too short');
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Validation failed: email already exists');
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Check if district already has a head
        const existingDistrictHead = await User.findOne({ 
            role: 'district_admin', 
            district: districtName 
        });
        if (existingDistrictHead) {
            console.log('Validation failed: district already has a head');
            return res.status(400).json({
                success: false,
                message: 'This district already has a district head assigned'
            });
        }

        // Create new district head
        console.log('Creating new district head user...');
        const districtHead = new User({
            name: `${districtName} District Head`,
            email,
            password, // Let the User model's pre-save hook hash this
            role: 'district_admin',
            adminRole: 'district_admin',
            district: districtName,
            isActive: true
        });

        console.log('Saving district head to database...');
        await districtHead.save();
        console.log('District head saved successfully!');

        // Verify the password works by testing it
        const savedUser = await User.findOne({ email });
        const passwordWorks = await savedUser.comparePassword(password);
        console.log('Password verification:', passwordWorks ? 'SUCCESS' : 'FAILED');

        res.status(201).json({
            success: true,
            message: 'District head created successfully',
            data: {
                _id: districtHead._id,
                districtName: districtHead.district,
                email: districtHead.email,
                name: districtHead.name,
                isActive: districtHead.isActive,
                createdAt: districtHead.createdAt,
                passwordVerified: passwordWorks
            }
        });

    } catch (error) {
        console.error('Create district head error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating district head',
            error: error.message
        });
    }
};

// Update district head
exports.updateDistrictHead = async (req, res) => {
    try {
        const { id } = req.params;
        const { districtName, email, password } = req.body;

        // Validate required fields
        if (!districtName || !email) {
            return res.status(400).json({
                success: false,
                message: 'District name and email are required'
            });
        }

        // Find district head
        const districtHead = await User.findById(id);
        if (!districtHead || districtHead.role !== 'district_admin') {
            return res.status(404).json({
                success: false,
                message: 'District head not found'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Check if email is already taken by another user
        if (email !== districtHead.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken by another user'
                });
            }
        }

        // Check if district is already assigned to another head
        if (districtName !== districtHead.district) {
            const existingDistrictHead = await User.findOne({ 
                role: 'district_admin', 
                district: districtName,
                _id: { $ne: id }
            });
            if (existingDistrictHead) {
                return res.status(400).json({
                    success: false,
                    message: 'This district already has a district head assigned'
                });
            }
        }

        // Update fields
        districtHead.district = districtName;
        districtHead.email = email;
        districtHead.name = `${districtName} District Head`;

        // Update password if provided
        if (password && password.length >= 6) {
            const salt = await bcrypt.genSalt(10);
            districtHead.password = await bcrypt.hash(password, salt);
        } else if (password && password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        await districtHead.save();

        res.json({
            success: true,
            message: 'District head updated successfully',
            data: {
                _id: districtHead._id,
                districtName: districtHead.district,
                email: districtHead.email,
                name: districtHead.name,
                isActive: districtHead.isActive,
                createdAt: districtHead.createdAt
            }
        });

    } catch (error) {
        console.error('Update district head error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating district head',
            error: error.message
        });
    }
};

// Delete district head
exports.deleteDistrictHead = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and verify district head
        const districtHead = await User.findById(id);
        if (!districtHead || districtHead.role !== 'district_admin') {
            return res.status(404).json({
                success: false,
                message: 'District head not found'
            });
        }

        // Check if district head has active reports or dependencies
        const activeReports = await Report.countDocuments({
            assignedTo: id,
            status: { $in: ['submitted', 'acknowledged', 'assigned', 'in_progress'] }
        });

        if (activeReports > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete district head with active reports. Please reassign or resolve reports first.'
            });
        }

        // Delete district head
        await User.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'District head deleted successfully'
        });

    } catch (error) {
        console.error('Delete district head error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting district head',
            error: error.message
        });
    }
};