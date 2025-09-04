const Report = require('../models/Report');
const User = require('../models/User');

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
    const { workerId } = req.body;
    try {
        let report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ msg: 'Report not found' });

        const worker = await User.findById(workerId);
        if (!worker || worker.role !== 'worker') {
            return res.status(400).json({ msg: 'Invalid worker ID' });
        }

        report.assignedTo = workerId;
        report.status = 'In Progress';
        await report.save();

        // TODO: Add notification logic here to inform the worker

        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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

        // Award points if status is changing to 'Resolved'
        if (report.status !== 'Resolved' && status === 'Resolved') {
            await User.findByIdAndUpdate(report.reportedBy, { $inc: { points: 10 } });
            report.resolvedAt = Date.now();
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
        
        res.json(report);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc Get detailed report analytics
// @route GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
    try {
        // Reports by location (top areas with most reports)
        const reportsByLocation = await Report.aggregate([
            {
                $group: {
                    _id: {
                        lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] },
                        lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] }
                    },
                    count: { $sum: 1 },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Daily report trends for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyTrends = await Report.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Performance metrics
        const performanceMetrics = await Report.aggregate([
            {
                $facet: {
                    totalMetrics: [
                        {
                            $group: {
                                _id: null,
                                totalReports: { $sum: 1 },
                                resolvedCount: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
                                avgResolutionTime: {
                                    $avg: {
                                        $cond: [
                                            { $and: [{ $eq: ['$status', 'resolved'] }, { $ne: ['$resolvedAt', null] }] },
                                            { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] },
                                            null
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    categoryPerformance: [
                        {
                            $group: {
                                _id: '$category',
                                total: { $sum: 1 },
                                resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
                                avgTime: {
                                    $avg: {
                                        $cond: [
                                            { $and: [{ $eq: ['$status', 'Resolved'] }, { $ne: ['$resolvedAt', null] }] },
                                            { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] },
                                            null
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        res.json({
            reportsByLocation,
            dailyTrends,
            performanceMetrics: performanceMetrics[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};