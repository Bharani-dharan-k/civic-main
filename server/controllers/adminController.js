const Report = require('../models/Report');
const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationService = require('../utils/notificationService');

// Helper function to check if admin is database user or hardcoded user
const isDatabaseAdmin = (adminId) => {
    return adminId && !adminId.startsWith('admin_') && adminId.length === 24;
};

// Helper function to get admin data
const getAdminUser = async (adminId) => {
    if (isDatabaseAdmin(adminId)) {
        return await User.findById(adminId);
    }
    return null; // Return null for hardcoded admins, will use default values
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        // Get admin user data to check district
        const adminUser = await getAdminUser(req.user.id);
        const userDistrict = adminUser?.district;
        
        // Build base query filter for district filtering
        let baseFilter = {};
        if (userDistrict) {
            baseFilter.district = userDistrict;
        }
        
        const totalReports = await Report.countDocuments(baseFilter);
        const resolvedReports = await Report.countDocuments({ ...baseFilter, status: 'resolved' });
        const inProgressReports = await Report.countDocuments({ ...baseFilter, status: 'in_progress' });
        const acknowledgedReports = await Report.countDocuments({ ...baseFilter, status: 'acknowledged' });
        const submittedReports = await Report.countDocuments({ ...baseFilter, status: 'submitted' });
        const pendingReports = totalReports - resolvedReports;
        
        // Only count citizens in the same district if district admin
        let citizenFilter = { role: 'citizen' };
        if (userDistrict) {
            citizenFilter.district = userDistrict;
        }
        const totalCitizens = await User.countDocuments(citizenFilter);
        const activeUsers = await User.countDocuments({ ...citizenFilter, isActive: true });

        // Reports by category with more details - district filtered
        const reportsByCategory = await Report.aggregate([
            { $match: baseFilter },
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
            }
        ]);

        // Monthly trends for the last 6 months - district filtered
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrends = await Report.aggregate([
            { $match: { ...baseFilter, createdAt: { $gte: sixMonthsAgo } } },
            { 
                $group: {
                    _id: { 
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalReports: { $sum: 1 },
                    resolvedReports: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] 
                        } 
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Status distribution - district filtered
        const statusDistribution = await Report.aggregate([
            { $match: baseFilter },
            { 
                $group: { 
                    _id: '$status', 
                    count: { $sum: 1 } 
                } 
            }
        ]);

        // Average resolution time (for resolved reports) - district filtered
        const avgResolutionTime = await Report.aggregate([
            { $match: { ...baseFilter, status: 'resolved', resolvedAt: { $exists: true } } },
            { 
                $project: {
                    resolutionTime: {
                        $divide: [
                            { $subtract: ['$resolvedAt', '$createdAt'] },
                            1000 * 60 * 60 * 24 // Convert to days
                        ]
                    }
                }
            },
            { 
                $group: {
                    _id: null,
                    averageDays: { $avg: '$resolutionTime' }
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalReports,
                resolvedReports,
                inProgressReports,
                acknowledgedReports,
                submittedReports,
                pendingReports,
                totalCitizens,
                activeUsers,
                reportsByCategory,
                monthlyTrends,
                statusDistribution,
                avgResolutionTime: avgResolutionTime.length > 0 ? Math.round(avgResolutionTime[0].averageDays * 10) / 10 : 0,
                district: userDistrict || null,
                // Additional metrics for district admin
                activeMunicipalities: userDistrict ? 1 : 0, // District admin manages their own district
                departmentPerformance: [], // Will be populated by separate API if needed
                municipalityPerformance: [] // Will be populated by separate API if needed
            },
            message: userDistrict ? `Statistics for ${userDistrict} district` : 'Global statistics'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Assign a worker to a report
// @route   PUT /api/admin/reports/:id/assign
exports.assignWorkerToReport = async (req, res) => {
    const { workerId, workerEmployeeId, priority, estimatedTime, notes } = req.body;
    try {
        let report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        // Import worker credentials from authController
        const { WORKER_CREDENTIALS } = require('./authController');
        
        // Use workerEmployeeId if provided, otherwise use workerId for backward compatibility
        const employeeId = workerEmployeeId || workerId;
        
        let worker = null;
        let assignedToValue = null;
        
        // Check if it's a predefined worker employee ID
        const predefinedWorker = WORKER_CREDENTIALS.find(w => w.employeeId === employeeId);
        
        if (predefinedWorker) {
            // It's a predefined worker
            worker = predefinedWorker;
            assignedToValue = employeeId;
        } else {
            // Check if it's a database User (staff member)
            const staffMember = await User.findById(employeeId);
            if (staffMember && ['field_staff', 'field_head', 'department_head', 'municipality_admin'].includes(staffMember.role)) {
                worker = {
                    employeeId: staffMember._id.toString(),
                    name: staffMember.name,
                    specialization: staffMember.department || staffMember.municipality || 'General',
                    phone: staffMember.phone || 'N/A'
                };
                assignedToValue = staffMember._id.toString();
            } else {
                return res.status(400).json({ success: false, message: 'Invalid worker ID or staff member not found' });
            }
        }

        report.assignedTo = assignedToValue;
        report.assignedBy = req.user.id; // Admin who assigned
        report.assignedAt = new Date();
        report.status = 'assigned';
        
        // Add admin notes if provided
        if (notes) {
            report.adminNotes.push({
                note: notes,
                addedBy: req.user.id,
                addedAt: new Date()
            });
        }
        
        // Set priority if provided
        if (priority) {
            report.priority = priority; // Keep the case as sent from frontend
        }
        
        await report.save();

        // Populate the report with user info for response
        await report.populate('reportedBy', 'name email');

        // Send notification to the user about worker assignment
        const workerName = worker.name;
        await NotificationService.notifyWorkerAssignment(
            report.reportedBy._id,
            report.title,
            workerName,
            report._id
        );

        res.json({
            success: true,
            message: `Report assigned to ${workerName} successfully`,
            data: {
                report,
                assignedWorker: worker
            }
        });
    } catch (err) {
        console.error('Assign worker error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message
        });
    }
};

// @desc Get citizen leaderboard
// @route GET /api/admin/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const leaders = await User.find({ role: 'citizen' })
            .sort({ points: -1 })
            .limit(10)
            .select('name points email createdAt');
        
        // Get report statistics for each leader
        const leadersWithStats = await Promise.all(
            leaders.map(async (leader) => {
                const totalReports = await Report.countDocuments({ reportedBy: leader._id });
                const resolvedReports = await Report.countDocuments({ 
                    reportedBy: leader._id, 
                    status: 'Resolved' 
                });
                
                return {
                    ...leader.toObject(),
                    totalReports,
                    resolvedReports,
                    resolutionRate: totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0
                };
            })
        );
        
        res.json(leadersWithStats);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc Get all reports with detailed information for admin
// @route GET /api/admin/reports
exports.getAllReports = async (req, res) => {
    try {
        const { status, category, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;
        
        // Get admin user data to check district
        const adminUser = await getAdminUser(req.user.id);
        const userDistrict = adminUser?.district;
        
        // Build filter object
        const filter = {};
        
        // Add district filter for district admins
        if (userDistrict) {
            filter.district = userDistrict;
        }
        
        if (status && status !== 'all') {
            // Handle multiple statuses separated by comma
            if (status.includes(',')) {
                filter.status = { $in: status.split(',') };
            } else {
                filter.status = status;
            }
        }
        if (category && category !== 'all') filter.category = category;
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort object
        const sortOrder = order === 'desc' ? -1 : 1;
        const sort = { [sortBy]: sortOrder };
        
        const reports = await Report.find(filter)
            .populate('reportedBy', 'name email phone')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
            
        const totalReports = await Report.countDocuments(filter);
        
        res.json({
            success: true,
            reports: reports, // Use 'reports' key for consistency with frontend
            data: reports,
            totalReports,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReports / parseInt(limit)),
            district: userDistrict || null,
            message: userDistrict ? 
                `Retrieved ${reports.length} reports for ${userDistrict} district` : 
                `Retrieved ${reports.length} reports successfully`
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message
        });
    }
};

// @desc Update report status by admin
// @route PUT /api/admin/reports/:id/status
exports.updateReportStatus = async (req, res) => {
    const { status, notes } = req.body;
    try {
        let report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ msg: 'Report not found' });

        const oldStatus = report.status;

        // Award points if status is changing to 'Resolved'
        if (report.status !== 'resolved' && status === 'resolved') {
            await User.findByIdAndUpdate(report.reportedBy, { $inc: { points: 10 } });
            report.resolvedAt = Date.now();
            
            // Send points notification
            await NotificationService.notifyPointsEarned(
                report.reportedBy,
                10,
                'Thank you for reporting an issue!'
            );
        }

        report.status = status;
        if (notes) {
            if (!report.adminNotes) report.adminNotes = [];
            report.adminNotes.push({
                note: notes,
                addedBy: req.user.id,
                addedAt: Date.now()
            });
        }
        
        await report.save();
        
        // Populate and return updated report
        await report.populate('reportedBy', 'name email');

        // Send notification about status update
        if (oldStatus !== status) {
            await NotificationService.notifyReportStatusUpdate(
                report.reportedBy._id,
                report.title,
                status,
                report._id
            );
        }
        
        res.json(report);
    } catch (err) {
        console.error('Update report status error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc Get detailed report analytics
// @route GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
    try {
        const currentDate = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get basic statistics
        const totalReports = await Report.countDocuments();
        const resolvedReports = await Report.countDocuments({ status: 'resolved' });
        const inProgressReports = await Report.countDocuments({ status: 'in_progress' });
        const thisMonthReports = await Report.countDocuments({
            createdAt: { $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) }
        });

        // Calculate resolution rate
        const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

        // Calculate average response time (in hours)
        const avgResponseTimeResult = await Report.aggregate([
            { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60] } }
                }
            }
        ]);
        const avgResponseTime = avgResponseTimeResult.length > 0 ? 
            Math.round(avgResponseTimeResult[0].avgTime * 10) / 10 : 0;

        // Monthly trends (last 6 months)
        const monthlyTrends = await Report.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    issues: { $sum: 1 },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Transform monthly trends to match frontend format
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const issuesTrend = monthlyTrends.map(item => ({
            name: monthNames[item._id.month - 1],
            issues: item.issues,
            resolved: item.resolved
        }));

        // Category distribution
        const categoryStats = await Report.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Transform categories to percentages
        const categoryData = categoryStats.map((item, index) => {
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6', '#EF4444', '#F97316', '#EC4899'];
            return {
                name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
                value: Math.round((item.count / totalReports) * 100),
                color: colors[index % colors.length]
            };
        });

        // Department performance (using assignedDepartment field)
        const departmentStats = await Report.aggregate([
            { $match: { assignedDepartment: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$assignedDepartment',
                    total: { $sum: 1 },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
                    avgResponseTime: {
                        $avg: {
                            $cond: [
                                { $and: [{ $eq: ['$status', 'resolved'] }, { $ne: ['$resolvedAt', null] }] },
                                { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60] },
                                null
                            ]
                        }
                    }
                }
            }
        ]);

        const departmentPerformance = departmentStats.map(dept => ({
            name: dept._id,
            efficiency: dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0,
            responseTime: dept.avgResponseTime ? `${Math.round(dept.avgResponseTime * 10) / 10} hrs` : 'N/A'
        }));

        // Reports by location (heatmap data)
        const locationHeatmap = await Report.aggregate([
            {
                $group: {
                    _id: {
                        lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 3] },
                        lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 3] }
                    },
                    count: { $sum: 1 },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        // Recent statistics for cards
        const recentStats = [
            {
                title: 'Issues This Month',
                value: thisMonthReports.toString(),
                change: '+12%', // This could be calculated based on previous month
                changeType: 'increase',
                icon: 'TrendingUp',
                color: 'blue'
            },
            {
                title: 'Resolution Rate',
                value: `${resolutionRate}%`,
                change: '+5%', // This could be calculated based on previous period
                changeType: 'increase',
                icon: 'BarChart3',
                color: 'green'
            },
            {
                title: 'Avg Response Time',
                value: `${avgResponseTime} hrs`,
                change: '-15%', // This could be calculated based on previous period
                changeType: 'decrease',
                icon: 'Calendar',
                color: 'purple'
            },
            {
                title: 'Total Reports',
                value: totalReports.toString(),
                change: `+${Math.round(((thisMonthReports / totalReports) * 100) || 0)}%`,
                changeType: 'increase',
                icon: 'PieChart',
                color: 'orange'
            }
        ];

        res.json({
            success: true,
            recentStats,
            issuesTrend,
            categoryData,
            departmentPerformance,
            locationHeatmap,
            totalReports,
            resolvedReports,
            resolutionRate,
            avgResponseTime
        });
    } catch (err) {
        console.error('Analytics error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching analytics data'
        });
    }
};

// @desc Export analytics report
// @route GET /api/admin/analytics/export
exports.exportAnalyticsReport = async (req, res) => {
    try {
        const { format = 'json', timeRange = '6months' } = req.query;
        
        // Calculate date range
        const currentDate = new Date();
        let startDate;
        
        switch (timeRange) {
            case '1month':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case '6months':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case '1year':
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate = new Date(0); // All time
        }

        // Get comprehensive report data
        const reportData = await Report.find({
            createdAt: { $gte: startDate }
        }).populate('reportedBy', 'name email').sort({ createdAt: -1 });

        // Summary statistics
        const totalReports = reportData.length;
        const resolvedReports = reportData.filter(r => r.status === 'resolved').length;
        const pendingReports = reportData.filter(r => r.status !== 'resolved').length;
        const resolutionRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(2) : 0;

        // Category breakdown
        const categoryBreakdown = {};
        reportData.forEach(report => {
            categoryBreakdown[report.category] = (categoryBreakdown[report.category] || 0) + 1;
        });

        // Department performance
        const departmentStats = {};
        reportData.forEach(report => {
            if (report.assignedDepartment) {
                if (!departmentStats[report.assignedDepartment]) {
                    departmentStats[report.assignedDepartment] = { total: 0, resolved: 0 };
                }
                departmentStats[report.assignedDepartment].total++;
                if (report.status === 'resolved') {
                    departmentStats[report.assignedDepartment].resolved++;
                }
            }
        });

        const exportData = {
            generated_at: new Date().toISOString(),
            time_range: timeRange,
            summary: {
                total_reports: totalReports,
                resolved_reports: resolvedReports,
                pending_reports: pendingReports,
                resolution_rate: `${resolutionRate}%`
            },
            category_breakdown: categoryBreakdown,
            department_performance: Object.keys(departmentStats).map(dept => ({
                department: dept,
                total_issues: departmentStats[dept].total,
                resolved_issues: departmentStats[dept].resolved,
                efficiency: `${((departmentStats[dept].resolved / departmentStats[dept].total) * 100).toFixed(2)}%`
            })),
            detailed_reports: reportData.map(report => ({
                id: report._id,
                title: report.title,
                category: report.category,
                status: report.status,
                created_at: report.createdAt,
                resolved_at: report.resolvedAt,
                reported_by: report.reportedBy ? report.reportedBy.name : 'Unknown',
                assigned_department: report.assignedDepartment,
                location: report.address
            }))
        };

        // Set response headers for download
        const fileName = `sevatrack_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}`;
        
        if (format === 'pdf') {
            // Generate PDF
            const pdfBuffer = await generatePDFReport(exportData);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
            res.send(pdfBuffer);
        } else if (format === 'csv') {
            // Convert to CSV format
            const csv = convertToCSV(exportData.detailed_reports);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
            res.send(csv);
        } else {
            // Default to JSON
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}.json"`);
            res.json(exportData);
        }
    } catch (error) {
        console.error('Export analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while exporting analytics data'
        });
    }
};

// Helper function to convert JSON to CSV
const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
};

// Helper function to generate PDF report
const generatePDFReport = async (data) => {
    try {
        // Create HTML content for PDF
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>SevaTrack Analytics Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #e97316;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #e97316;
                    margin: 0;
                    font-size: 28px;
                }
                .header p {
                    margin: 10px 0;
                    color: #666;
                }
                .summary {
                    background: #f9fafb;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .summary h2 {
                    color: #374151;
                    margin-top: 0;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin: 20px 0;
                }
                .stat-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #e97316;
                }
                .stat-label {
                    font-size: 14px;
                    color: #6b7280;
                    margin-top: 5px;
                }
                .section {
                    margin: 30px 0;
                }
                .section h3 {
                    color: #374151;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                th, td {
                    border: 1px solid #e5e7eb;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background: #f3f4f6;
                    font-weight: 600;
                }
                .category-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #f3f4f6;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>SevaTrack Analytics Report</h1>
                <p>Comprehensive Civic Issue Management Analysis</p>
                <p>Generated on: ${new Date(data.generated_at).toLocaleDateString()}</p>
                <p>Time Range: ${data.time_range}</p>
            </div>

            <div class="summary">
                <h2>Executive Summary</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${data.summary.total_reports}</div>
                        <div class="stat-label">Total Reports</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.summary.resolved_reports}</div>
                        <div class="stat-label">Resolved Issues</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.summary.pending_reports}</div>
                        <div class="stat-label">Pending Issues</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.summary.resolution_rate}</div>
                        <div class="stat-label">Resolution Rate</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>Issues by Category</h3>
                ${Object.entries(data.category_breakdown).map(([category, count]) => `
                    <div class="category-item">
                        <span>${category}</span>
                        <span><strong>${count}</strong> issues</span>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h3>Department Performance</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Total Issues</th>
                            <th>Resolved</th>
                            <th>Efficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.department_performance.map(dept => `
                            <tr>
                                <td>${dept.department}</td>
                                <td>${dept.total_issues}</td>
                                <td>${dept.resolved_issues}</td>
                                <td>${dept.efficiency}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h3>Recent Issues Summary</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Department</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.detailed_reports.slice(0, 20).map(report => `
                            <tr>
                                <td>${report.title}</td>
                                <td>${report.category}</td>
                                <td>${report.status}</td>
                                <td>${new Date(report.created_at).toLocaleDateString()}</td>
                                <td>${report.assigned_department || 'Not Assigned'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${data.detailed_reports.length > 20 ? '<p><em>Showing first 20 issues. Complete data available in other export formats.</em></p>' : ''}
            </div>

            <div class="footer">
                <p>This report was generated by SevaTrack - Civic Issue Management System</p>
                <p>For more information, contact your system administrator</p>
            </div>
        </body>
        </html>
        `;

        // Use puppeteer to generate PDF
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm'
            }
        });
        
        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF report');
    }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id/status
exports.updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const reportId = req.params.id;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Validate status
        const validStatuses = ['submitted', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        report.status = status;
        if (status === 'resolved') {
            report.resolvedAt = new Date();
        }

        await report.save();

        // Create notification for status update
        if (report.userId) {
            await NotificationService.createStatusUpdateNotification(
                report.userId, 
                report._id, 
                status
            );
        }

        res.json({
            success: true,
            message: 'Report status updated successfully',
            report
        });
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating report status'
        });
    }
};

// @desc    Assign department to report
// @route   PUT /api/admin/reports/:id/assign-department
exports.assignDepartmentToReport = async (req, res) => {
    try {
        const { department } = req.body;
        const reportId = req.params.id;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        report.assignedDepartment = department;
        report.status = 'assigned';
        report.assignedAt = new Date();

        await report.save();

        // Create notification for department assignment
        if (report.userId) {
            await NotificationService.createAssignmentNotification(
                report.userId, 
                report._id, 
                { department }
            );
        }

        res.json({
            success: true,
            message: 'Department assigned successfully',
            report
        });
    } catch (error) {
        console.error('Error assigning department:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while assigning department'
        });
    }
};

// @desc    Update a report
// @route   PUT /api/admin/reports/:id
exports.updateReport = async (req, res) => {
    try {
        const { title, description, category, priority, status, address } = req.body;
        const reportId = req.params.id;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Update fields if provided
        if (title) report.title = title;
        if (description) report.description = description;
        if (category) report.category = category;
        if (priority) report.priority = priority;
        if (status) {
            report.status = status;
            if (status === 'resolved') {
                report.resolvedAt = new Date();
            }
        }
        if (address) report.address = address;

        await report.save();

        // Create notification for report update
        if (report.userId) {
            await NotificationService.createStatusUpdateNotification(
                report.userId, 
                report._id, 
                report.status
            );
        }

        res.json({
            success: true,
            message: 'Report updated successfully',
            report
        });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating report'
        });
    }
};

// @desc    Delete a report
// @route   DELETE /api/admin/reports/:id
exports.deleteReport = async (req, res) => {
    try {
        const reportId = req.params.id;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Delete the report
        await Report.findByIdAndDelete(reportId);

        // Create notification for report deletion (optional)
        if (report.userId) {
            await NotificationService.createNotification(
                report.userId,
                'Report Deleted',
                `Your report "${report.title}" has been deleted by an administrator.`,
                'warning',
                'Medium'
            );
        }

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting report'
        });
    }
};

// @desc    Get admin notifications
// @route   GET /api/admin/notifications
exports.getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get admin user data to check district
        const adminUser = await getAdminUser(req.user.id);
        const adminId = req.user.id;
        const userDistrict = adminUser?.district;

        let filter = {};
        
        // For hardcoded admins without district info, return system notifications only
        if (!isDatabaseAdmin(adminId) && !userDistrict) {
            filter = { type: 'system' }; // System notifications for all admins
        } else if (userDistrict) {
            // For district admins, get district-specific and system notifications
            filter = {
                $or: [
                    { district: userDistrict }, // District-specific notifications
                    { type: 'system' }, // System notifications for all admins
                    { userId: adminId } // Personal notifications
                ]
            };
        } else {
            // For database admins without district restriction, get personal and system notifications
            filter = {
                $or: [
                    { userId: adminId },
                    { type: 'system' } // System notifications for all admins
                ]
            };
        }

        const notifications = await Notification.find(filter)
            .populate('relatedReport', 'title category')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Notification.countDocuments(filter);

        const unreadFilter = { ...filter, read: false };
        const unreadCount = await Notification.countDocuments(unreadFilter);

        console.log(`✅ Admin notifications loaded for district: ${userDistrict || 'all'} (${notifications.length} notifications, ${unreadCount} unread)`);

        return res.json({
            success: true,
            notifications,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            unreadCount,
            district: userDistrict
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id/read
exports.markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/admin/notifications/mark-all-read
exports.markAllNotificationsRead = async (req, res) => {
    try {
        const adminId = req.user.id;

        // Handle different admin types
        if (!isDatabaseAdmin(adminId)) {
            // For hardcoded admins, only mark system notifications as read
            await Notification.updateMany(
                {
                    type: 'system',
                    read: false
                },
                { read: true }
            );
        } else {
            // For database admins, mark personal and system notifications as read
            await Notification.updateMany(
                {
                    $or: [
                        { userId: adminId },
                        { type: 'system' }
                    ],
                    read: false
                },
                { read: true }
            );
        }

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read'
        });
    }
};

// @desc    Get admin profile settings
// @route   GET /api/admin/settings/profile
exports.getProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        
        // Handle database admin
        if (isDatabaseAdmin(adminId)) {
            const admin = await User.findById(adminId).select('-password');
            
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            return res.json({
                success: true,
                profile: {
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone || '',
                    designation: admin.designation || 'System Administrator',
                    department: admin.department || 'Information Technology',
                    location: admin.location || 'Not specified',
                    avatar: admin.avatar || null,
                    createdAt: admin.createdAt,
                    lastLogin: admin.lastLogin
                }
            });
        }

        // Handle hardcoded admin (fallback with default values)
        return res.json({
            success: true,
            profile: {
                name: req.user.name || 'Admin User',
                email: req.user.email || 'admin@civic.gov.in',
                phone: '+91 98765 43210',
                designation: 'System Administrator',
                department: 'Information Technology',
                location: 'New Delhi',
                avatar: null,
                createdAt: new Date(),
                lastLogin: new Date()
            }
        });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/settings/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, designation, department, location } = req.body;
        const adminId = req.user.id;
        
        // Handle database admin
        if (isDatabaseAdmin(adminId)) {
            const updatedAdmin = await User.findByIdAndUpdate(
                adminId,
                {
                    name,
                    email,
                    phone,
                    designation,
                    department,
                    location,
                    updatedAt: Date.now()
                },
                { new: true }
            ).select('-password');

            return res.json({
                success: true,
                message: 'Profile updated successfully',
                profile: updatedAdmin
            });
        }

        // Handle hardcoded admin (cannot be updated)
        return res.json({
            success: false,
            message: 'Cannot update hardcoded admin profile. Please use database admin account.'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

// @desc    Change admin password
// @route   PUT /api/admin/settings/password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.user.id;
        
        // Handle database admin
        if (isDatabaseAdmin(adminId)) {
            const admin = await User.findById(adminId);
            
            // Check current password
            const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update password
            admin.password = newPassword;
            await admin.save();

            return res.json({
                success: true,
                message: 'Password changed successfully'
            });
        }

        // Handle hardcoded admin (cannot change password)
        return res.json({
            success: false,
            message: 'Cannot change password for hardcoded admin. Please use database admin account.'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

// @desc    Get notification settings
// @route   GET /api/admin/settings/notifications
exports.getNotificationSettings = async (req, res) => {
    try {
        const adminId = req.user.id;
        
        // Handle database admin
        if (isDatabaseAdmin(adminId)) {
            const admin = await User.findById(adminId);
            
            const settings = admin.notificationSettings || {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,
                issueAssignment: true,
                issueResolution: true,
                systemAlerts: true,
                weeklyReports: false,
                monthlyReports: true
            };

            return res.json({
                success: true,
                settings
            });
        }

        // Handle hardcoded admin (return default settings)
        return res.json({
            success: true,
            settings: {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,
                issueAssignment: true,
                issueResolution: true,
                systemAlerts: true,
                weeklyReports: false,
                monthlyReports: true
            }
        });
    } catch (error) {
        console.error('Error fetching notification settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification settings'
        });
    }
};

// @desc    Update notification settings
// @route   PUT /api/admin/settings/notifications
exports.updateNotificationSettings = async (req, res) => {
    try {
        const settings = req.body;
        const adminId = req.user.id;
        
        // Handle database admin
        if (isDatabaseAdmin(adminId)) {
            await User.findByIdAndUpdate(
                adminId,
                { notificationSettings: settings },
                { new: true }
            );

            return res.json({
                success: true,
                message: 'Notification settings updated successfully',
                settings
            });
        }

        // Handle hardcoded admin (cannot save settings but return success)
        return res.json({
            success: true,
            message: 'Settings acknowledged (cannot persist for hardcoded admin)',
            settings
        });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification settings'
        });
    }
};

// @desc    Get system settings
// @route   GET /api/admin/settings/system
exports.getSystemSettings = async (req, res) => {
    try {
        const adminId = req.user.id;
        
        // Handle database admin
        if (isDatabaseAdmin(adminId)) {
            const admin = await User.findById(adminId);
            
            const settings = admin.systemSettings || {
                autoAssignment: true,
                priorityBasedRouting: true,
                citizenFeedback: true,
                publicDashboard: false,
                issueTimeout: '48',
                maxFileSize: '10',
                allowedFileTypes: 'jpg,jpeg,png,pdf'
            };

            return res.json({
                success: true,
                settings
            });
        }

        // Handle hardcoded admin (return default settings)
        return res.json({
            success: true,
            settings: {
                autoAssignment: true,
                priorityBasedRouting: true,
                citizenFeedback: true,
                publicDashboard: false,
                issueTimeout: '48',
                maxFileSize: '10',
                allowedFileTypes: 'jpg,jpeg,png,pdf'
            }
        });
    } catch (error) {
        console.error('Error fetching system settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system settings'
        });
    }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings/system
exports.updateSystemSettings = async (req, res) => {
    try {
        const settings = req.body;
        const adminId = req.user.id;
        
        // Handle database admin
        if (isDatabaseAdmin(adminId)) {
            await User.findByIdAndUpdate(
                adminId,
                { systemSettings: settings },
                { new: true }
            );

            return res.json({
                success: true,
                message: 'System settings updated successfully',
                settings
            });
        }

        // Handle hardcoded admin (cannot save settings but return success)
        return res.json({
            success: true,
            message: 'Settings acknowledged (cannot persist for hardcoded admin)',
            settings
        });
    } catch (error) {
        console.error('Error updating system settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update system settings'
        });
    }
};

// @desc    Get all district users (department admins, etc.)
// @route   GET /api/admin/users
exports.getDistrictUsers = async (req, res) => {
    try {
        // Get admin user data to check district
        const adminUser = await getAdminUser(req.user.id);
        const userDistrict = adminUser?.district;
        
        // Build filter for district-specific users
        const filter = { 
            role: { $in: ['department_head', 'municipality_admin', 'field_head', 'citizen'] }
        };
        
        // Add district filter for district admins
        if (userDistrict) {
            filter.district = userDistrict;
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });

        console.log(`✅ District users loaded for district: ${userDistrict || 'all'} (${users.length} users)`);

        res.json({
            success: true,
            users,
            district: userDistrict
        });
    } catch (error) {
        console.error('Error fetching district users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch district users'
        });
    }
};

// @desc    Create new department admin
// @route   POST /api/admin/users
exports.createDepartmentAdmin = async (req, res) => {
    try {
        console.log('🔍 CREATE USER REQUEST - Full body:', req.body);
        console.log('🔍 CREATE USER REQUEST - Body keys:', Object.keys(req.body));
        console.log('🔍 CREATE USER REQUEST - User info:', req.user);
        
        const { 
            name, 
            email, 
            password, 
            role, 
            department, 
            district, 
            municipality,
            phone 
        } = req.body;

        console.log('🔍 Extracted values:', {
            name, email, role, department, municipality, district, phone,
            passwordProvided: !!password
        });

        // Validate required fields
        if (!name || !email || !password || !role) {
            console.log('❌ Validation failed - missing basic fields');
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, and role are required'
            });
        }

        // Role-specific validation
        if (role === 'department_head' && !department) {
            console.log('❌ Department Head validation failed - no department provided');
            return res.status(400).json({
                success: false,
                message: 'Department is required for Department Head role'
            });
        }

        if (role === 'municipality_admin' && !municipality) {
            console.log('❌ Municipality Admin validation failed - no municipality provided');
            console.log('❌ Municipality value received:', municipality);
            return res.status(400).json({
                success: false,
                message: 'Municipality is required for Municipality Admin role'
            });
        }

        console.log('✅ Basic validation passed');

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Get current admin's district and municipality for defaults
        const currentAdmin = await User.findById(req.user.id);
        const userDistrict = district || currentAdmin?.district || 'Bokaro';
        const userMunicipality = municipality || currentAdmin?.municipality || 'Bokaro Municipality';

        // Create new user with all required fields
        const userData = {
            name,
            email,
            password, // The User model should hash this
            role: role || 'department_head',
            adminRole: role || 'department_head', // Set adminRole same as role
            district: userDistrict,
            phone: phone || '',
            isActive: true,
            createdBy: req.user.id,
            createdAt: new Date()
        };

        // Add role-specific fields
        if (role === 'department_head') {
            userData.department = department;
            userData.municipality = userMunicipality; // Department heads belong to a municipality
        } else if (role === 'municipality_admin') {
            userData.municipality = municipality || userMunicipality;
            // Municipality admins don't have a specific department
        }

        console.log('🔍 Creating user with data:', userData);
        const newUser = new User(userData);
        console.log('🔍 User model created, saving...');

        await newUser.save();
        console.log('✅ User saved successfully with ID:', newUser._id);

        // Return user without password
        const userResponse = await User.findById(newUser._id).select('-password');
        
        res.status(201).json({
            success: true,
            message: 'Department admin created successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Error creating department admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create department admin: ' + (error.message || error)
        });
    }
};

// @desc    Update department admin
// @route   PUT /api/admin/users/:id
exports.updateDepartmentAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, department, district, municipality, phone, isActive } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (department) user.department = department;
        if (district) user.district = district;
        if (municipality) user.municipality = municipality;
        if (phone) user.phone = phone;
        if (typeof isActive === 'boolean') user.isActive = isActive;
        
        user.updatedAt = new Date();
        user.updatedBy = req.user.id;

        await user.save();

        const updatedUser = await User.findById(id).select('-password');
        
        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
};

// @desc    Delete department admin
// @route   DELETE /api/admin/users/:id
exports.deleteDepartmentAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(id);
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};

// @desc    Reset user password
// @route   PUT /api/admin/users/:id/reset-password
exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password is required'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.password = newPassword; // User model should hash this
        user.updatedAt = new Date();
        user.updatedBy = req.user.id;
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password'
        });
    }
};

// @desc    Get municipal staff data
// @route   GET /api/admin/staff
exports.getStaffData = async (req, res) => {
    try {
        console.log('📋 Fetching staff data...');
        const staff = await User.find({
            role: { $in: ['field_staff', 'field_head', 'department_head'] }
        }).select('-password');

        console.log(`👥 Found ${staff.length} staff members`);
        res.json({
            success: true,
            data: staff
        });
    } catch (error) {
        console.error('Error fetching staff data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch staff data'
        });
    }
};

// @desc    Add new staff member
// @route   POST /api/admin/staff
exports.addStaffMember = async (req, res) => {
    try {
        console.log('👤 Adding new staff member...');
        const { name, email, phone, role, department, ward } = req.body;

        // Validate required fields
        if (!name || !email || !role || !department) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (name, email, role, department)'
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

        // Generate default password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = 'staff123'; // You might want to generate a random password
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        // Set adminRole based on role
        let adminRole = null;
        if (['department_head', 'field_head'].includes(role)) {
            adminRole = role;
        }

        // Create new staff member
        const newStaff = new User({
            name,
            email,
            phone: phone || '0000000000',
            password: hashedPassword,
            role,
            adminRole,
            userType: role === 'field_staff' ? 'worker' : 'admin',
            department,
            district: 'Central District', // Default district
            municipality: 'Central Municipal Corporation', // Default municipality
            ward: ward || 'General',
            verified: true,
            isActive: true,
            attendance: 0,
            tasks_completed: 0,
            createdBy: req.user.id
        });

        await newStaff.save();

        console.log(`✅ Staff member created: ${name} (${role})`);
        res.status(201).json({
            success: true,
            message: 'Staff member added successfully',
            data: {
                id: newStaff._id,
                name: newStaff.name,
                email: newStaff.email,
                role: newStaff.role,
                department: newStaff.department,
                ward: newStaff.ward,
                defaultPassword: defaultPassword // Send back for first login
            }
        });
    } catch (error) {
        console.error('❌ Error adding staff member:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add staff member'
        });
    }
};

// @desc    Assign task to staff member
// @route   POST /api/admin/tasks
exports.assignTask = async (req, res) => {
    try {
        console.log('📋 Creating new task assignment...');
        const { staffId, title, description, priority, deadline } = req.body;

        // Validate required fields
        if (!staffId || !title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide staff ID, title, and description'
            });
        }

        // Check if staff member exists
        const User = require('../models/User');
        const staff = await User.findById(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Create new task
        const Task = require('../models/Task');
        const newTask = new Task({
            title,
            description,
            priority: priority || 'medium',
            deadline: deadline ? new Date(deadline) : null,
            assignedTo: staffId,
            assignedBy: req.user.id,
            status: 'assigned'
        });

        await newTask.save();

        // Populate the task with staff details for response
        const populatedTask = await Task.findById(newTask._id)
            .populate('assignedTo', 'name email role department')
            .populate('assignedBy', 'name email');

        console.log(`✅ Task assigned: ${title} to ${staff.name}`);
        res.status(201).json({
            success: true,
            message: 'Task assigned successfully',
            data: populatedTask
        });
    } catch (error) {
        console.error('❌ Error assigning task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign task'
        });
    }
};

// @desc    Get tasks for a staff member or all tasks
// @route   GET /api/admin/tasks
exports.getTasks = async (req, res) => {
    try {
        const { staffId, status } = req.query;
        
        let query = {};
        if (staffId) query.assignedTo = staffId;
        if (status) query.status = status;

        const Task = require('../models/Task');
        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email role department')
            .populate('assignedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('❌ Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks'
        });
    }
};

// @desc    Get infrastructure status
// @route   GET /api/admin/infrastructure
exports.getInfrastructureStatus = async (req, res) => {
    try {
        // Get infrastructure-related reports
        const infrastructureReports = await Report.find({
            category: { $in: ['pothole', 'streetlight', 'drainage', 'maintenance', 'electrical'] }
        });

        const waterReports = await Report.find({ category: 'drainage' });
        const electricalReports = await Report.find({ category: 'electrical' });
        const roadReports = await Report.find({ category: 'pothole' });

        const infrastructureStatus = {
            waterSupply: {
                dailySupply: 45000,
                quality: 'Good',
                coverage: 95,
                maintenance: waterReports.filter(r => r.status === 'in_progress').length
            },
            electrical: {
                streetLights: 1250,
                working: electricalReports.filter(r => r.status === 'resolved').length || 1180,
                maintenance: electricalReports.filter(r => r.status === 'in_progress').length || 70
            },
            roads: {
                totalLength: 245,
                goodCondition: 185,
                needsRepair: roadReports.filter(r => r.status !== 'resolved').length || 35,
                underMaintenance: roadReports.filter(r => r.status === 'in_progress').length || 25
            },
            wasteManagement: {
                dailyCollection: 125,
                recycled: 45,
                landfill: 80,
                coverage: 98
            }
        };

        res.json({
            success: true,
            data: infrastructureStatus
        });
    } catch (error) {
        console.error('Error fetching infrastructure status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch infrastructure status'
        });
    }
};

// @desc    Get finance data
// @route   GET /api/admin/finance
exports.getFinanceData = async (req, res) => {
    try {
        // This would typically come from a financial database
        const financeData = {
            propertyTax: {
                collected: 125000000,
                pending: 25000000,
                target: 150000000
            },
            waterCharges: {
                collected: 45000000,
                pending: 8000000,
                target: 53000000
            },
            permits: {
                collected: 12000000,
                pending: 3000000,
                target: 15000000
            },
            monthlyRevenue: [
                { month: 'Jan', revenue: 15000000, expenses: 12000000 },
                { month: 'Feb', revenue: 16000000, expenses: 13000000 },
                { month: 'Mar', revenue: 14000000, expenses: 11000000 },
                { month: 'Apr', revenue: 18000000, expenses: 14000000 },
                { month: 'May', revenue: 17000000, expenses: 13500000 },
                { month: 'Jun', revenue: 19000000, expenses: 15000000 }
            ]
        };

        res.json({
            success: true,
            data: financeData
        });
    } catch (error) {
        console.error('Error fetching finance data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch finance data'
        });
    }
};

// @desc    Get projects data
// @route   GET /api/admin/projects
exports.getProjectsData = async (req, res) => {
    try {
        // This would typically come from a projects database
        // For now, returning sample data based on reports and infrastructure needs
        const projects = [
            {
                id: 1,
                name: 'Smart Water Management System',
                status: 'in_progress',
                budget: 50000000,
                spent: 30000000,
                completion: 60,
                startDate: '2025-01-01',
                endDate: '2025-06-30',
                department: 'Water Department'
            },
            {
                id: 2,
                name: 'Road Infrastructure Upgrade',
                status: 'in_progress',
                budget: 75000000,
                spent: 45000000,
                completion: 75,
                startDate: '2024-11-01',
                endDate: '2025-03-31',
                department: 'Public Works'
            },
            {
                id: 3,
                name: 'Digital Waste Management',
                status: 'planning',
                budget: 25000000,
                spent: 2000000,
                completion: 15,
                startDate: '2025-02-01',
                endDate: '2025-08-31',
                department: 'Sanitation'
            }
        ];

        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error('Error fetching projects data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects data'
        });
    }
};

// @desc    Get emergency alerts
// @route   GET /api/admin/emergency-alerts
exports.getEmergencyAlerts = async (req, res) => {
    try {
        // Get high priority reports as emergency alerts
        const emergencyReports = await Report.find({
            priority: { $in: ['High', 'Critical'] },
            status: { $ne: 'resolved' }
        }).populate('reportedBy', 'name phone email').sort({ createdAt: -1 });

        const alerts = emergencyReports.map(report => ({
            id: report._id,
            title: report.title,
            type: report.category,
            severity: report.priority.toLowerCase(),
            location: report.address,
            status: report.status,
            reportedBy: report.reportedBy?.name || 'Anonymous',
            createdAt: report.createdAt,
            description: report.description
        }));

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Error fetching emergency alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch emergency alerts'
        });
    }
};

// @desc    Get service requests
// @route   GET /api/admin/service-requests
exports.getServiceRequests = async (req, res) => {
    try {
        console.log('🔧 Fetching service requests...');
        
        // For now, we'll create service requests from reports that require approvals or permits
        // These could be categorized as maintenance, electrical, plumbing requests
        const serviceReports = await Report.find({
            category: { $in: ['maintenance', 'electrical', 'plumbing'] },
            status: { $in: ['submitted', 'acknowledged', 'assigned'] }
        }).populate('reportedBy', 'name phone email').sort({ createdAt: -1 });

        console.log(`📊 Found ${serviceReports.length} service reports`);
        console.log('📋 Categories:', serviceReports.map(r => r.category));

        const serviceRequests = serviceReports.map(report => ({
            id: report._id,
            title: report.title,
            type: report.category,
            ward: report.ward || 'Unknown',
            status: report.status,
            applicant: report.reportedBy?.name || 'Anonymous',
            phone: report.reportedBy?.phone || '',
            documents: 'Complete', // Mock for now
            fee: report.category === 'electrical' ? 1500 : report.category === 'plumbing' ? 2500 : 500, // Mock fees
            createdAt: report.createdAt,
            description: report.description,
            address: report.address
        }));

        console.log('✅ Service requests processed successfully');
        res.json({
            success: true,
            data: serviceRequests
        });
    } catch (error) {
        console.error('❌ Error fetching service requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch service requests'
        });
    }
};

// @desc    Get municipalities for district admin
// @route   GET /api/admin/municipalities  
exports.getMunicipalities = async (req, res) => {
    try {
        console.log('🔍 Getting municipalities for district:', req.user.district);
        
        // Get municipality admins from the current district
        const municipalityAdmins = await User.find({
            role: 'municipality_admin',
            district: req.user.district
        }).select('name email municipality district createdAt');

        // Get some basic stats for each municipality
        const municipalityData = await Promise.all(municipalityAdmins.map(async (admin) => {
            // Get reports for this municipality
            let reportStats = { total: 0, resolved: 0, pending: 0 };
            
            try {
                const reports = await Report.find({ 
                    municipality: admin.municipality 
                });
                
                reportStats = {
                    total: reports.length,
                    resolved: reports.filter(r => r.status === 'resolved').length,
                    pending: reports.filter(r => ['new', 'in_progress'].includes(r.status)).length
                };
            } catch (err) {
                console.log('Could not load report stats:', err.message);
            }

            return {
                _id: admin._id,
                name: admin.municipality,
                district: admin.district,
                adminName: admin.name,
                adminEmail: admin.email,
                totalReports: reportStats.total,
                resolvedReports: reportStats.resolved,
                pendingReports: reportStats.pending,
                createdAt: admin.createdAt
            };
        }));

        console.log('✅ Found municipalities:', municipalityData);
        res.json({
            success: true,
            municipalities: municipalityData,
            count: municipalityData.length
        });
        
    } catch (error) {
        console.error('❌ Error getting municipalities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get municipalities: ' + (error.message || error)
        });
    }
};

// @desc    Send announcement/notification to users
// @route   POST /api/admin/announcements
exports.sendAnnouncement = async (req, res) => {
    try {
        const { title, message, sendTo, priority = 'medium' } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required'
            });
        }

        const adminUser = await getAdminUser(req.user.id);
        const adminDistrict = adminUser?.district;
        
        let targetUsers = [];
        let createdNotifications = 0;

        // Determine target users based on sendTo parameter
        switch (sendTo) {
            case 'all':
                // Send to all users in the district (if admin has district) or all users
                const allFilter = adminDistrict ? { district: adminDistrict } : {};
                targetUsers = await User.find(allFilter);
                break;
                
            case 'municipality_admins':
                const muniFilter = { role: 'municipality_admin' };
                if (adminDistrict) muniFilter.district = adminDistrict;
                targetUsers = await User.find(muniFilter);
                break;
                
            case 'department_heads':
                const deptFilter = { role: 'department_head' };
                if (adminDistrict) deptFilter.district = adminDistrict;
                targetUsers = await User.find(deptFilter);
                break;
                
            case 'citizens':
                const citizenFilter = { role: 'citizen' };
                if (adminDistrict) citizenFilter.district = adminDistrict;
                targetUsers = await User.find(citizenFilter);
                break;
                
            default:
                // Check if it's a specific municipality
                if (sendTo.startsWith('municipality_')) {
                    const municipalityId = sendTo.replace('municipality_', '');
                    targetUsers = await User.find({ 
                        role: 'municipality_admin',
                        _id: municipalityId 
                    });
                }
                break;
        }

        // Create notifications for all target users
        for (const user of targetUsers) {
            await NotificationService.createNotification(
                user._id,
                title,
                message,
                'announcement',
                null,
                priority
            );
            createdNotifications++;
        }

        console.log(`✅ Announcement sent to ${createdNotifications} users by admin from ${adminDistrict || 'system'}`);

        res.json({
            success: true,
            message: `Announcement sent successfully to ${createdNotifications} ${sendTo === 'all' ? 'users' : sendTo.replace('_', ' ')}`,
            recipientCount: createdNotifications,
            district: adminDistrict
        });
        
    } catch (error) {
        console.error('❌ Error sending announcement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send announcement: ' + (error.message || error)
        });
    }
};

// @desc    Get escalated reports for district admin
// @route   GET /api/admin/escalations
exports.getEscalations = async (req, res) => {
    try {
        // Get admin user data to check district
        const adminUser = await getAdminUser(req.user.id);
        const userDistrict = adminUser?.district;
        
        // Build base query filter for district filtering
        let baseFilter = {};
        if (userDistrict) {
            baseFilter.district = userDistrict;
        }

        // Define criteria for escalated reports
        const escalationCriteria = {
            $or: [
                // Reports in progress for more than 7 days
                {
                    status: 'in_progress',
                    assignedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                },
                // High or Critical priority reports older than 3 days
                {
                    priority: { $in: ['High', 'Critical'] },
                    createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
                    status: { $nin: ['resolved', 'closed'] }
                },
                // Reports pending for more than 10 days
                {
                    status: { $in: ['submitted', 'acknowledged', 'assigned'] },
                    createdAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
                }
            ],
            ...baseFilter
        };

        const escalatedReports = await Report.find(escalationCriteria)
            .populate('reportedBy', 'name email phone')
            .sort({ priority: -1, createdAt: 1 })
            .limit(50);

        // Calculate escalation statistics
        const totalEscalations = await Report.countDocuments(escalationCriteria);
        const resolvedThisMonth = await Report.countDocuments({
            ...baseFilter,
            status: 'resolved',
            resolvedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
            $or: [
                { priority: { $in: ['High', 'Critical'] } },
                { actualResolutionTime: { $gt: 168 } } // Took more than 1 week
            ]
        });

        // Group by municipality for better organization
        const escalationsByMunicipality = escalatedReports.reduce((acc, report) => {
            const municipality = report.urbanLocalBody || 'Unknown';
            if (!acc[municipality]) {
                acc[municipality] = [];
            }
            acc[municipality].push(report);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                escalations: escalatedReports,
                escalationsByMunicipality,
                statistics: {
                    totalPending: totalEscalations,
                    resolvedThisMonth,
                    averageResponseTime: 0, // Calculate if needed
                    priorityBreakdown: {
                        critical: escalatedReports.filter(r => r.priority === 'Critical').length,
                        high: escalatedReports.filter(r => r.priority === 'High').length,
                        medium: escalatedReports.filter(r => r.priority === 'Medium').length,
                        low: escalatedReports.filter(r => r.priority === 'Low').length
                    }
                }
            },
            district: userDistrict
        });
        
    } catch (error) {
        console.error('❌ Error fetching escalations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch escalations: ' + (error.message || error)
        });
    }
};

// @desc    Handle escalation action (resolve, reassign, update priority)
// @route   POST /api/admin/escalations/:id/action
exports.handleEscalationAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes, priority, assignTo, department } = req.body;
        
        // Get admin user data to check district
        const adminUser = await getAdminUser(req.user.id);
        const userDistrict = adminUser?.district;
        
        // Find the report and verify it's in the admin's district
        let report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Escalated report not found'
            });
        }

        // Verify district access
        if (userDistrict && report.district !== userDistrict) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Report not in your district'
            });
        }

        const adminId = req.user.id;
        const currentTime = new Date();

        switch (action) {
            case 'resolve':
                report.status = 'resolved';
                report.resolvedAt = currentTime;
                if (notes) {
                    report.adminNotes.push({
                        note: `ESCALATION RESOLVED: ${notes}`,
                        addedBy: adminId,
                        addedAt: currentTime
                    });
                }
                break;

            case 'reassign':
                if (assignTo) report.assignedTo = assignTo;
                if (department) report.assignedDepartment = department;
                report.assignedBy = adminId;
                report.assignedAt = currentTime;
                report.status = 'assigned';
                if (notes) {
                    report.adminNotes.push({
                        note: `ESCALATION REASSIGNED: ${notes}`,
                        addedBy: adminId,
                        addedAt: currentTime
                    });
                }
                break;

            case 'updatePriority':
                if (priority) {
                    const oldPriority = report.priority;
                    report.priority = priority;
                    report.adminNotes.push({
                        note: `ESCALATION PRIORITY UPDATED: Changed from ${oldPriority} to ${priority}${notes ? '. Notes: ' + notes : ''}`,
                        addedBy: adminId,
                        addedAt: currentTime
                    });
                }
                break;

            case 'addComment':
                if (notes) {
                    report.adminNotes.push({
                        note: `ESCALATION COMMENT: ${notes}`,
                        addedBy: adminId,
                        addedAt: currentTime
                    });
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid escalation action'
                });
        }

        const updatedReport = await report.save();
        
        res.json({
            success: true,
            message: `Escalation ${action} completed successfully`,
            data: updatedReport
        });
        
    } catch (error) {
        console.error('❌ Error handling escalation action:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to handle escalation action: ' + (error.message || error)
        });
    }
};

// @desc    Get all available municipalities for a district (for creating new admins)
// @route   GET /api/admin/available-municipalities
exports.getAvailableMunicipalities = async (req, res) => {
    try {
        console.log('🔍 Getting available municipalities for district:', req.user.district);
        console.log('🔍 Full user info:', {
            id: req.user.id,
            email: req.user.email,
            district: req.user.district,
            role: req.user.role
        });
        
        // Define municipality mapping for Jharkhand districts
        const municipalityMapping = {
            'Bokaro': ['Bokaro Steel City', 'Chas Municipality', 'Bermo Municipality', 'Jaridih Municipality', 'Gomia Municipality', 'Phusro Nagar Parishad'],
            'Ranchi': ['Ranchi Municipal Corporation', 'Bundu Nagar Panchayat', 'Tamar Nagar Panchayat', 'Sonahatu Nagar Panchayat', 'Angara Nagar Panchayat'],
            'Dhanbad': ['Dhanbad Municipal Corporation', 'Jharia Municipality', 'Sindri Municipality', 'Nirsa Municipality', 'Govindpur Municipality', 'Chirkunda Nagar Panchayat'],
            'East Singhbhum': ['Jamshedpur Notified Area Committee', 'Jugsalai Municipality', 'Chakulia Municipality', 'Dhalbhumgarh Municipality', 'Ghatshila Municipality'],
            'Hazaribagh': ['Hazaribagh Municipality', 'Ramgarh Municipality', 'Barhi Municipality', 'Ichak Municipality'],
            'Giridih': ['Giridih Municipality', 'Dumri Municipality', 'Bengabad Municipality'],
            'Deoghar': ['Deoghar Municipal Corporation', 'Jasidih Municipality', 'Madhupur Municipality'],
            'Dumka': ['Dumka Municipality', 'Shikaripara Municipality', 'Basukinath Nagar Parishad'],
            'Godda': ['Godda Municipality', 'Mahagama Municipality'],
            'Sahibganj': ['Sahibganj Municipality', 'Rajmahal Municipality'],
            'Pakur': ['Pakur Municipality', 'Littipara Municipality'],
            'Palamu': ['Medininagar Municipality', 'Daltonganj Municipality'],
            'Garhwa': ['Garhwa Municipality', 'Ranka Municipality', 'Majhion Nagar Parishad'],
            'Latehar': ['Latehar Municipality', 'Barwadih Municipality'],
            'Chatra': ['Chatra Municipality', 'Hunterganj Municipality'],
            'Koderma': ['Koderma Municipality', 'Jhumri Telaiya Municipality'],
            'Jamtara': ['Jamtara Municipality', 'Narayanpur Municipality'],
            'Gumla': ['Gumla Municipality', 'Bishunpur Municipality'],
            'Simdega': ['Simdega Municipality', 'Bolba Municipality'],
            'Lohardaga': ['Lohardaga Municipality', 'Senha Municipality'],
            'Khunti': ['Khunti Municipality', 'Torpa Municipality'],
            'West Singhbhum': ['Chaibasa Municipality', 'Manoharpur Municipality'],
            'Seraikela Kharsawan': ['Seraikela Municipality', 'Kharsawan Municipality'],
            'Ramgarh': ['Ramgarh Municipality', 'Patratu Municipality']
        };
        
        let userDistrict = req.user.district;
        console.log('🔍 Available districts in mapping:', Object.keys(municipalityMapping));
        console.log('🔍 Looking for district:', userDistrict);
        
        // Handle different district name formats
        let availableMunicipalities = municipalityMapping[userDistrict] || [];
        
        // If not found, try some common variations
        if (availableMunicipalities.length === 0) {
            const variations = [
                userDistrict?.replace(' District', ''),
                userDistrict?.replace('District', '').trim(),
                userDistrict?.split(' ')[0], // Take first word
                'Bokaro' // Default fallback for testing
            ];
            
            for (const variation of variations) {
                if (variation && municipalityMapping[variation]) {
                    console.log('🔍 Found district using variation:', variation);
                    userDistrict = variation;
                    availableMunicipalities = municipalityMapping[variation];
                    break;
                }
            }
        }
        
        console.log('🔍 Raw municipalities found:', availableMunicipalities);
        
        if (availableMunicipalities.length === 0) {
            console.log('⚠️ No municipalities found for district:', userDistrict);
            console.log('⚠️ Available districts:', Object.keys(municipalityMapping));
        }
        
        // Get existing municipality admins to show which ones already have admins
        const existingAdmins = await User.find({
            role: 'municipality_admin',
            district: userDistrict
        }).select('municipality');
        
        const existingMunicipalities = existingAdmins.map(admin => admin.municipality);
        console.log('🔍 Existing municipality admins:', existingMunicipalities);
        
        // Format municipality data
        const municipalityData = availableMunicipalities.map((municipality, index) => ({
            id: `${userDistrict.toLowerCase().replace(' ', '-')}-${index}`,
            name: municipality,
            district: userDistrict,
            hasAdmin: existingMunicipalities.includes(municipality)
        }));
        
        console.log(`✅ Found ${municipalityData.length} available municipalities for ${userDistrict}`);
        
        res.json({
            success: true,
            municipalities: municipalityData,
            count: municipalityData.length,
            district: userDistrict
        });
        
    } catch (error) {
        console.error('❌ Error getting available municipalities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available municipalities: ' + (error.message || error)
        });
    }
};