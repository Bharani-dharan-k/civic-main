const Task = require('../models/Task');
const Staff = require('../models/Staff');
const Resource = require('../models/Resource');
const Project = require('../models/Project');
const Budget = require('../models/Budget');
const Report = require('../models/Report');
const User = require('../models/User');

// Dashboard Overview
const getDashboardOverview = async (req, res) => {
    try {
        const { user } = req;
        
        if (!user || user.role !== 'department_head') {
            return res.status(403).json({ message: 'Access denied. Department head role required.' });
        }

        // Get department from user profile or use default
        const department = user.department || 'general';

        // Fetch counts and data
        const [
            totalTasks,
            pendingTasks,
            completedTasks,
            totalStaff,
            activeStaff,
            totalReports,
            pendingReports,
            totalProjects,
            activeProjects,
            totalResources,
            availableResources
        ] = await Promise.all([
            Task.countDocuments({ department }),
            Task.countDocuments({ department, status: { $in: ['assigned', 'in_progress'] } }),
            Task.countDocuments({ department, status: 'completed' }),
            Staff.countDocuments({ department }),
            Staff.countDocuments({ department, status: 'active' }),
            Report.countDocuments(),
            Report.countDocuments({ status: 'pending' }),
            Project.countDocuments({ department }),
            Project.countDocuments({ department, status: 'ongoing' }),
            Resource.countDocuments({ department }),
            Resource.countDocuments({ department, status: 'active' })
        ]);

        // Recent tasks
        const recentTasks = await Task.find({ department })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        // Budget info
        const budget = await Budget.findOne({ 
            department, 
            status: 'active' 
        }).sort({ createdAt: -1 });

        const dashboardData = {
            overview: {
                tasks: {
                    total: totalTasks,
                    pending: pendingTasks,
                    completed: completedTasks
                },
                staff: {
                    total: totalStaff,
                    active: activeStaff
                },
                reports: {
                    total: totalReports,
                    pending: pendingReports
                },
                projects: {
                    total: totalProjects,
                    active: activeProjects
                },
                resources: {
                    total: totalResources,
                    available: availableResources
                }
            },
            recentTasks,
            budget: budget ? {
                allocated: budget.totalAllocated,
                spent: budget.categories.reduce((sum, cat) => sum + cat.spent, 0),
                remaining: budget.totalAllocated - budget.categories.reduce((sum, cat) => sum + cat.spent, 0)
            } : null
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Tasks Management
const getTasks = async (req, res) => {
    try {
        const { user } = req;
        const { status, type, page = 1, limit = 10 } = req.query;
        
        const department = user.department || 'general';
        const query = { department };
        
        if (status && status !== 'all') query.status = status;
        if (type && type !== 'all') query.type = type;

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email phone')
            .populate('assignedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Task.countDocuments(query);

        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const { user } = req;
        const { title, description, priority, assignedTo, deadline } = req.body;
        
        const department = user.department || 'general';

        // Convert assignedTo to ObjectId if it's a staff member
        let assignedToId = null;
        if (assignedTo) {
            // Try to find staff member by employeeId first
            const staff = await Staff.findOne({ employeeId: assignedTo });
            if (staff) {
                assignedToId = staff.user;
            } else {
                // Try to find user directly
                const userAssigned = await User.findById(assignedTo);
                if (userAssigned) {
                    assignedToId = assignedTo;
                }
            }
        }

        const task = new Task({
            title,
            description,
            priority,
            assignedTo: assignedToId,
            assignedBy: user.id,
            status: 'assigned',
            deadline: deadline ? new Date(deadline) : undefined,
            department
        });

        await task.save();
        await task.populate('assignedTo', 'name email phone');

        res.status(201).json({
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, notes } = req.body;
        const { user } = req;

        const task = await Task.findByIdAndUpdate(
            taskId,
            { 
                status,
                ...(status === 'completed' && { completedDate: new Date() })
            },
            { new: true }
        ).populate('assignedTo', 'name email');

        if (notes) {
            task.comments.push({
                user: user._id,
                message: notes
            });
            await task.save();
        }

        res.json({
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Staff Management
const getStaff = async (req, res) => {
    try {
        const { user } = req;
        const { status, position } = req.query || {};
        
        const department = user.department || 'general';
        const query = { department };
        
        if (status && status !== 'all') query.status = status;
        if (position && position !== 'all') query.position = position;

        const staff = await Staff.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        // Calculate attendance and task counts for each staff member
        const staffWithStats = await Promise.all(staff.map(async (member) => {
            const totalDays = member.attendance.length;
            const presentDays = member.attendance.filter(a => a.status === 'present').length;
            const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

            // Get task counts for this staff member
            const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
                Task.countDocuments({ assignedTo: member.user, department }),
                Task.countDocuments({ assignedTo: member.user, department, status: 'completed' }),
                Task.countDocuments({ assignedTo: member.user, department, status: { $in: ['assigned', 'in_progress'] } })
            ]);

            return {
                ...member.toObject(),
                attendancePercentage,
                taskStats: {
                    total: totalTasks,
                    completed: completedTasks,
                    pending: pendingTasks
                }
            };
        }));

        res.json(staffWithStats);
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createStaff = async (req, res) => {
    try {
        const { user } = req;
        const { employeeId, name, email, phone, position, joinDate } = req.body;
        
        const department = user.department || 'general';
        const municipality = user.municipality || 'default';
        const district = user.district || 'default';

        // Create user first
        const newUser = new User({
            name,
            email,
            phone,
            role: 'field_staff',
            password: 'defaultpass123', // Should be changed on first login
            department,
            municipality,
            district,
            createdBy: user.id
        });

        await newUser.save();

        // Create staff record
        const staff = new Staff({
            employeeId,
            user: newUser._id,
            name,
            department,
            position,
            phone,
            email,
            joinDate: joinDate || new Date(),
            status: 'active'
        });

        await staff.save();
        await staff.populate('user', 'name email phone');

        res.status(201).json({
            message: 'Staff member added successfully',
            staff
        });
    } catch (error) {
        console.error('Create staff error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Resources Management
const getResources = async (req, res) => {
    try {
        const { user } = req;
        const { type, status } = req.query;
        
        const department = user.department || 'general';
        const query = { department };
        
        if (type && type !== 'all') query.type = type;
        if (status && status !== 'all') query.status = status;

        const resources = await Resource.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Projects Management
const getProjects = async (req, res) => {
    try {
        const { user } = req;
        const department = user.department || 'general';

        const projects = await Project.find({ department })
            .populate('projectManager', 'name email')
            .populate('team.member', 'name email')
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Budget Management
const getBudgetInfo = async (req, res) => {
    try {
        const { user } = req;
        const department = user.department || 'general';
        const currentYear = new Date().getFullYear().toString();

        const budget = await Budget.findOne({ 
            department, 
            financialYear: currentYear,
            status: 'active'
        });

        if (!budget) {
            return res.json({ 
                message: 'No active budget found',
                budget: null 
            });
        }

        res.json({ budget });
    } catch (error) {
        console.error('Get budget error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Complaints Management
const getComplaints = async (req, res) => {
    try {
        const { status, priority } = req.query;
        const query = {};
        
        if (status && status !== 'all') query.status = status;
        if (priority && priority !== 'all') query.priority = priority;

        const complaints = await Report.find(query)
            .populate('reportedBy', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(complaints);
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Pending Reports for Task Assignment
const getPendingReports = async (req, res) => {
    try {
        const { user } = req;
        const department = user.department || 'general';
        
        // Get all reports that need action (pending, submitted, acknowledged)
        const pendingReports = await Report.find({ 
            status: { $in: ['pending', 'submitted', 'acknowledged'] }
            // You can add department filtering if reports have department field
            // department: department 
        })
            .populate('reportedBy', 'name email phone')
            .select('title description category priority location status createdAt reportedBy')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(pendingReports);
    } catch (error) {
        console.error('Get pending reports error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Report Progress Data
const getReportProgress = async (req, res) => {
    try {
        const { user } = req;
        const department = user.department || 'general';
        
        // Get all reports with their associated tasks and progress information
        const reports = await Report.find({})
            .populate('reportedBy', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(100);

        // For each report, find associated tasks and enrich with progress data
        const reportsWithProgress = await Promise.all(reports.map(async (report) => {
            let relatedTasks = [];
            
            // Find tasks related to this report only if report has a title
            if (report.title && typeof report.title === 'string') {
                try {
                    relatedTasks = await Task.find({
                        $or: [
                            { description: { $regex: report.title, $options: 'i' } },
                            { title: { $regex: report.title, $options: 'i' } }
                        ]
                    }).populate('assignedTo', 'name email').sort({ createdAt: -1 });
                } catch (taskError) {
                    console.error('Error finding related tasks for report:', report._id, taskError);
                    relatedTasks = [];
                }
            }

            // Get the most recent task for this report
            const currentTask = relatedTasks.length > 0 ? relatedTasks[0] : null;
            
            // Calculate progress timestamps based on report and task status
            const progressData = {
                ...report.toObject(),
                // Task information
                currentTask: currentTask,
                assignedTo: currentTask?.assignedTo || null,
                taskStatus: currentTask?.status || null,
                
                // Progress timestamps
                acknowledgedAt: report.status !== 'submitted' ? report.updatedAt : null,
                assignedAt: currentTask ? currentTask.createdAt : null,
                startedAt: currentTask?.status === 'in_progress' ? currentTask.updatedAt : null,
                completedAt: report.status === 'resolved' || currentTask?.status === 'completed' ? 
                             (currentTask?.updatedAt || report.updatedAt) : null,
                
                // Enhanced status based on task status
                effectiveStatus: currentTask ? 
                    (currentTask.status === 'assigned' ? 'assigned' :
                     currentTask.status === 'in_progress' ? 'in_progress' :
                     currentTask.status === 'completed' ? 'completed' : report.status) 
                    : report.status,
                
                // Related tasks count
                totalTasks: relatedTasks.length,
                activeTasks: relatedTasks.filter(task => ['assigned', 'in_progress'].includes(task.status)).length
            };

            return progressData;
        }));

        // Format response to match frontend expectations
        const formattedReports = reportsWithProgress.map(report => ({
            _id: report._id,
            subject: report.title, // Map title to subject for frontend
            description: report.description,
            location: report.address || 'Unknown location',
            status: report.effectiveStatus || report.status,
            priority: report.priority || 'medium',
            category: report.category || 'other',
            citizenName: report.reportedBy?.name || 'Unknown citizen',
            citizenEmail: report.reportedBy?.email || 'N/A',
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
            assignedTo: report.assignedTo ? {
                name: report.assignedTo.name,
                email: report.assignedTo.email
            } : null,
            currentTask: report.currentTask,
            totalTasks: report.totalTasks,
            activeTasks: report.activeTasks
        }));

        res.json({ 
            success: true, 
            reports: formattedReports,
            total: formattedReports.length 
        });
    } catch (error) {
        console.error('Get report progress error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch report progress data', 
            error: error.message 
        });
    }
};

module.exports = {
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
};