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
        const totalReports = await Report.countDocuments();
        const resolvedReports = await Report.countDocuments({ status: 'Resolved' });
        const inProgressReports = await Report.countDocuments({ status: 'In Progress' });
        const acknowledgedReports = await Report.countDocuments({ status: 'Acknowledged' });
        const submittedReports = await Report.countDocuments({ status: 'Submitted' });
        const pendingReports = totalReports - resolvedReports;
        const totalCitizens = await User.countDocuments({ role: 'citizen' });
        const activeUsers = await User.countDocuments({ role: 'citizen', isActive: true });

        // Reports by category with more details
        const reportsByCategory = await Report.aggregate([
            { 
                $group: { 
                    _id: '$category', 
                    count: { $sum: 1 },
                    resolved: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] 
                        } 
                    }
                } 
            }
        ]);

        // Monthly trends for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrends = await Report.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { 
                $group: {
                    _id: { 
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalReports: { $sum: 1 },
                    resolvedReports: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] 
                        } 
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Status distribution
        const statusDistribution = await Report.aggregate([
            { 
                $group: { 
                    _id: '$status', 
                    count: { $sum: 1 } 
                } 
            }
        ]);

        // Average resolution time (for resolved reports)
        const avgResolutionTime = await Report.aggregate([
            { $match: { status: 'Resolved', resolvedAt: { $exists: true } } },
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
            averageResolutionDays: avgResolutionTime.length > 0 ? Math.round(avgResolutionTime[0].averageDays * 10) / 10 : 0
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
        if (!report) return res.status(404).json({ msg: 'Report not found' });

        // Import worker credentials from authController
        const { WORKER_CREDENTIALS } = require('./authController');
        
        // Use workerEmployeeId if provided, otherwise use workerId for backward compatibility
        const employeeId = workerEmployeeId || workerId;
        
        // Check if the employeeId exists in predefined workers
        const worker = WORKER_CREDENTIALS.find(w => w.employeeId === employeeId);
        if (!worker) {
            return res.status(400).json({ msg: 'Invalid worker ID' });
        }

        report.assignedTo = employeeId; // Store employeeId
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
            message: 'Worker assigned successfully',
            report
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
        
        // Build filter object
        const filter = {};
        if (status && status !== 'all') filter.status = status;
        if (category && category !== 'all') filter.category = category;
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort object
        const sortOrder = order === 'desc' ? -1 : 1;
        const sort = { [sortBy]: sortOrder };
        
        const reports = await Report.find(filter)
            .populate('reportedBy', 'name email phone')
            .populate('assignedTo', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
            
        const totalReports = await Report.countDocuments(filter);
        
        res.json({
            reports,
            totalReports,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReports / parseInt(limit))
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
        await report.populate('assignedTo', 'name email');

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

        // Get admin user ID from the token
        const adminId = req.user.id;

        // For hardcoded admins, return system notifications only
        if (!isDatabaseAdmin(adminId)) {
            const notifications = await Notification.find({ 
                type: 'system' // System notifications for all admins
            })
            .populate('relatedReport', 'title category')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

            const total = await Notification.countDocuments({
                type: 'system'
            });

            const unreadCount = await Notification.countDocuments({
                type: 'system',
                read: false
            });

            return res.json({
                success: true,
                notifications,
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                },
                unreadCount
            });
        }

        // For database admins, get personal and system notifications
        const notifications = await Notification.find({ 
            $or: [
                { userId: adminId },
                { type: 'system' } // System notifications for all admins
            ]
        })
        .populate('relatedReport', 'title category')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

        const total = await Notification.countDocuments({
            $or: [
                { userId: adminId },
                { type: 'system' }
            ]
        });

        const unreadCount = await Notification.countDocuments({
            $or: [
                { userId: adminId },
                { type: 'system' }
            ],
            read: false
        });

        res.json({
            success: true,
            notifications,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            unreadCount
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