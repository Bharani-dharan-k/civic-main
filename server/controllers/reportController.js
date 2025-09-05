const Report = require('../models/Report');
const User = require('../models/User');
const NotificationService = require('../utils/notificationService');

// Predefined workers from authController - keep in sync with authController.js
const WORKER_CREDENTIALS = [
    {
        employeeId: 'FIELD001',
        name: 'Field Worker 1 - Ram',
        specialization: 'General Maintenance',
        phone: '+91-9876543210'
    },
    {
        employeeId: 'TECH002',
        name: 'Technician Raj Kumar',
        specialization: 'Electrical & Plumbing',
        phone: '+91-9876543211'
    },
    {
        employeeId: 'CLEAN003',
        name: 'Sanitation Worker - Suresh',
        specialization: 'Waste Management',
        phone: '+91-9876543212'
    },
    {
        employeeId: 'MECH004',
        name: 'Mechanic - Ravi',
        specialization: 'Vehicle Maintenance',
        phone: '+91-9876543213'
    },
    {
        employeeId: 'ELEC005',
        name: 'Electrician - Mohan',
        specialization: 'Electrical Work',
        phone: '+91-9876543214'
    },
    {
        employeeId: 'PLUMB006',
        name: 'Plumber - Vijay',
        specialization: 'Plumbing Work',
        phone: '+91-9876543215'
    }
];

// @desc    Create a new report by citizen
exports.createReport = async (req, res) => {
    console.log('=== CREATE REPORT ===', req.body);
    const { title, description, category, longitude, latitude, address, ward } = req.body;
    
    try {
        const imageUrl = req.file ? req.file.path : req.body.imageUrl || '';
        
        const newReport = new Report({
            title,
            description,
            category: category.toLowerCase(),
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            address: address || `Location: ${latitude}, ${longitude}`,
            ward: ward || 'Ward 1',
            imageUrl,
            reportedBy: req.user.id,
            priority: determinePriority(category, description),
            estimatedResolutionTime: getEstimatedTime(category)
        });

        const report = await newReport.save();
        
        // Populate the user info for response
        await report.populate('reportedBy', 'name email');
        
        // Send notification to user about report submission
        await NotificationService.notifySystem(
            req.user.id,
            'Report Submitted Successfully',
            `Your report "${title}" has been submitted and is being reviewed.`,
            'medium'
        );
        
        console.log('Report created successfully:', report._id);
        
        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            report
        });
    } catch (err) {
        console.error('Create report error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create report',
            error: err.message
        });
    }
};

// @desc    Get all reports for admin dashboard
exports.getAllReports = async (req, res) => {
    try {
        const { status, category, priority, assignedTo, limit } = req.query;
        
        // Build filter object
        let filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (assignedTo) filter.assignedTo = assignedTo;
        
        console.log('Fetching reports with filter:', filter);
        
        let query = Report.find(filter)
            .populate('reportedBy', 'name email phone')
            .sort({ createdAt: -1 });
            
        // Apply limit if specified
        if (limit) {
            query = query.limit(parseInt(limit));
        }
        
        const reports = await query;
        
        console.log(`Found ${reports.length} reports`);
        
        res.json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (err) {
        console.error('Get reports error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports'
        });
    }
};

// @desc    Get reports by current user (citizen)
exports.getUserReports = async (req, res) => {
    try {
        const reports = await Report.find({ reportedBy: req.user.id })
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });
            
        res.json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (err) {
        console.error('Get user reports error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user reports'
        });
    }
};

// @desc    Get reports assigned to a specific worker
exports.getWorkerReports = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const reports = await Report.find({ assignedTo: employeeId })
            .populate('reportedBy', 'name email phone')
            .sort({ assignedAt: -1 });
        
        res.json({
            success: true,
            count: reports.length,
            reports: reports.map(report => ({
                id: report._id,
                title: report.title,
                description: report.description,
                category: report.category,
                status: report.status,
                priority: report.priority,
                address: report.address,
                location: {
                    lat: report.location.coordinates[1],
                    lng: report.location.coordinates[0]
                },
                imageUrl: report.imageUrl,
                reportedBy: report.reportedBy,
                assignedAt: report.assignedAt,
                estimatedTime: `${report.estimatedResolutionTime} hours`,
                workProgressPhotos: report.workProgressPhotos,
                workerNotes: report.workerNotes,
                createdAt: report.createdAt
            }))
        });
    } catch (err) {
        console.error('Get worker reports error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch worker reports'
        });
    }
};

// @desc    Get a single report by ID
exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('reportedBy', 'name email phone')
            .populate('assignedBy', 'name email');
            
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        
        res.json({
            success: true,
            report
        });
    } catch (err) {
        console.error('Get report by ID error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch report'
        });
    }
};

// @desc    Assign report to worker (Admin only)
exports.assignReportToWorker = async (req, res) => {
    console.log('=== ASSIGN REPORT TO WORKER ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    const { reportId } = req.params;
    const { workerEmployeeId, priority, estimatedTime, notes } = req.body;
    
    try {
        // Verify worker exists
        const worker = WORKER_CREDENTIALS.find(w => w.employeeId === workerEmployeeId);
        if (!worker) {
            return res.status(400).json({
                success: false,
                message: 'Worker not found'
            });
        }
        
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        
        // Update report with assignment details
        report.assignedTo = workerEmployeeId;
        report.assignedBy = req.user.id;
        report.assignedAt = new Date();
        report.status = 'assigned';
        
        if (priority) report.priority = priority;
        if (estimatedTime) report.estimatedResolutionTime = estimatedTime;
        
        // Add admin note if provided
        if (notes) {
            report.adminNotes.push({
                note: notes,
                addedBy: req.user.id,
                addedAt: new Date()
            });
        }
        
        await report.save();
        await report.populate('reportedBy', 'name email');
        
        console.log(`Report ${reportId} assigned to worker ${workerEmployeeId}`);
        
        res.json({
            success: true,
            message: `Report assigned to ${worker.name}`,
            report
        });
    } catch (err) {
        console.error('Assign report error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to assign report'
        });
    }
};

// @desc    Update report status by worker
exports.updateReportStatus = async (req, res) => {
    console.log('=== UPDATE REPORT STATUS ===');
    const { reportId } = req.params;
    const { status, notes, location, progressPhoto } = req.body;
    
    try {
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        
        // Update status
        const oldStatus = report.status;
        report.status = status;
        
        // Handle status-specific updates
        if (status === 'in_progress' && oldStatus === 'assigned') {
            report.workerStartedAt = new Date();
        }
        
        if (status === 'resolved') {
            report.resolvedAt = new Date();
            
            // Calculate actual resolution time
            if (report.workerStartedAt) {
                const timeDiff = new Date() - report.workerStartedAt;
                report.actualResolutionTime = Math.round(timeDiff / (1000 * 60 * 60)); // in hours
            }
            
            // Award points to citizen
            await User.findByIdAndUpdate(report.reportedBy, { 
                $inc: { points: getPointsForResolution(report.category, report.priority) } 
            });
        }
        
        // Add worker note
        if (notes) {
            report.workerNotes.push({
                note: notes,
                addedBy: report.assignedTo,
                addedAt: new Date(),
                location: location || null
            });
        }
        
        // Add progress photo
        if (progressPhoto) {
            report.workProgressPhotos.push({
                url: progressPhoto,
                uploadedBy: report.assignedTo,
                uploadedAt: new Date(),
                type: status === 'resolved' ? 'completion' : 'progress'
            });
        }
        
        await report.save();
        await report.populate('reportedBy', 'name email');
        
        console.log(`Report ${reportId} status updated to ${status}`);
        
        res.json({
            success: true,
            message: `Report status updated to ${status}`,
            report
        });
    } catch (err) {
        console.error('Update report status error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update report status'
        });
    }
};

// @desc    Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {
            total: await Report.countDocuments(),
            submitted: await Report.countDocuments({ status: 'submitted' }),
            acknowledged: await Report.countDocuments({ status: 'acknowledged' }),
            assigned: await Report.countDocuments({ status: 'assigned' }),
            inProgress: await Report.countDocuments({ status: 'in_progress' }),
            resolved: await Report.countDocuments({ status: 'resolved' }),
            rejected: await Report.countDocuments({ status: 'rejected' })
        };
        
        // Category breakdown
        const categoryStats = await Report.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Priority breakdown
        const priorityStats = await Report.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Recent reports (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const recentReports = await Report.countDocuments({
            createdAt: { $gte: weekAgo }
        });
        
        res.json({
            success: true,
            stats: {
                ...stats,
                recentReports,
                categoryBreakdown: categoryStats,
                priorityBreakdown: priorityStats
            }
        });
    } catch (err) {
        console.error('Get dashboard stats error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
};

// @desc    Get leaderboard data
exports.getLeaderboard = async (req, res) => {
    try {
        const citizens = await User.find({ role: 'citizen' }, 'name points email')
            .sort({ points: -1 })
            .limit(10);

        const leaderboardData = await Promise.all(
            citizens.map(async (citizen) => {
                const totalReports = await Report.countDocuments({ reportedBy: citizen._id });
                const resolvedReports = await Report.countDocuments({ 
                    reportedBy: citizen._id, 
                    status: 'resolved' 
                });

                return {
                    _id: citizen._id,
                    name: citizen.name,
                    email: citizen.email,
                    points: citizen.points || 0,
                    totalReports,
                    resolvedReports,
                    resolutionRate: totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0
                };
            })
        );

        res.json({
            success: true,
            leaderboard: leaderboardData
        });
    } catch (err) {
        console.error('Get leaderboard error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard'
        });
    }
};

// Helper functions
function determinePriority(category, description) {
    const highPriorityKeywords = ['emergency', 'urgent', 'dangerous', 'major', 'severe'];
    const lowPriorityKeywords = ['minor', 'small', 'cosmetic'];
    
    const text = (category + ' ' + description).toLowerCase();
    
    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
        return 'High';
    }
    
    if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
        return 'Low';
    }
    
    // Category-based priority
    const highPriorityCategories = ['drainage', 'electrical'];
    const lowPriorityCategories = ['cleaning', 'garbage'];
    
    if (highPriorityCategories.includes(category.toLowerCase())) {
        return 'High';
    }
    
    if (lowPriorityCategories.includes(category.toLowerCase())) {
        return 'Low';
    }
    
    return 'Medium';
}

function getEstimatedTime(category) {
    const timeMap = {
        'pothole': 4,
        'streetlight': 2,
        'garbage': 1,
        'drainage': 6,
        'maintenance': 3,
        'electrical': 3,
        'plumbing': 4,
        'cleaning': 2,
        'other': 3
    };
    
    return timeMap[category.toLowerCase()] || 3;
}

function getPointsForResolution(category, priority) {
    const basePoints = {
        'pothole': 15,
        'streetlight': 10,
        'garbage': 5,
        'drainage': 20,
        'maintenance': 10,
        'electrical': 15,
        'plumbing': 15,
        'cleaning': 5,
        'other': 10
    };
    
    const priorityMultiplier = {
        'Low': 1,
        'Medium': 1.2,
        'High': 1.5,
        'Critical': 2
    };
    
    const base = basePoints[category.toLowerCase()] || 10;
    const multiplier = priorityMultiplier[priority] || 1;
    
    return Math.round(base * multiplier);
}