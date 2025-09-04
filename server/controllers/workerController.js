const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Get assigned tasks for worker
// @route   GET /api/worker/tasks
exports.getAssignedTasks = async (req, res) => {
    try {
        const workerId = req.user.id;
        
        // Find reports assigned to this worker
        const tasks = await Report.find({ 
            assignedTo: workerId,
            status: { $in: ['In Progress', 'Acknowledged'] }
        })
        .populate('reportedBy', 'name email phone')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            tasks,
            count: tasks.length
        });
    } catch (err) {
        console.error('Get tasks error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error fetching tasks' 
        });
    }
};

// @desc    Update task status
// @route   PUT /api/worker/tasks/:id/status
exports.updateTaskStatus = async (req, res) => {
    const { status, notes, location } = req.body;
    
    try {
        let task = await Report.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ 
                success: false,
                msg: 'Task not found' 
            });
        }

        // Check if task is assigned to this worker
        if (task.assignedTo !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                msg: 'Access denied. Task not assigned to you.' 
            });
        }

        // Update status
        task.status = status;
        
        // Add worker notes
        if (!task.workerNotes) task.workerNotes = [];
        if (notes) {
            task.workerNotes.push({
                note: notes,
                addedBy: req.user.id,
                addedAt: Date.now(),
                location: location
            });
        }

        // Set completion time if resolved
        if (status === 'Resolved') {
            task.resolvedAt = Date.now();
            
            // Award points to the citizen who reported
            await User.findByIdAndUpdate(task.reportedBy, { $inc: { points: 10 } });
        }

        await task.save();

        // Populate and return updated task
        await task.populate('reportedBy', 'name email');
        
        res.json({
            success: true,
            task
        });
    } catch (err) {
        console.error('Update task status error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error updating task status' 
        });
    }
};

// @desc    Upload work progress photos
// @route   POST /api/worker/tasks/:id/photos
exports.uploadTaskPhotos = async (req, res) => {
    try {
        const task = await Report.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ 
                success: false,
                msg: 'Task not found' 
            });
        }

        // Check if task is assigned to this worker
        if (task.assignedTo !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                msg: 'Access denied. Task not assigned to you.' 
            });
        }

        // Handle multiple file uploads
        const uploadedFiles = req.files ? req.files.map(file => file.path) : [];
        
        if (uploadedFiles.length === 0) {
            return res.status(400).json({ 
                success: false,
                msg: 'No files uploaded' 
            });
        }

        // Add photos to task
        if (!task.workProgressPhotos) task.workProgressPhotos = [];
        task.workProgressPhotos.push(...uploadedFiles.map(path => ({
            url: path,
            uploadedBy: req.user.id,
            uploadedAt: Date.now(),
            type: 'progress'
        })));

        // If this is a completion photo, also set as resolution image
        if (req.body.isCompletion === 'true' && uploadedFiles.length > 0) {
            task.resolutionImageUrl = uploadedFiles[0];
        }

        await task.save();

        res.json({
            success: true,
            message: `${uploadedFiles.length} photos uploaded successfully`,
            photos: task.workProgressPhotos
        });
    } catch (err) {
        console.error('Upload photos error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error uploading photos' 
        });
    }
};

// @desc    Get worker statistics
// @route   GET /api/worker/stats
exports.getWorkerStats = async (req, res) => {
    try {
        const workerId = req.user.id;
        
        const totalAssigned = await Report.countDocuments({ assignedTo: workerId });
        const completed = await Report.countDocuments({ 
            assignedTo: workerId, 
            status: 'Resolved' 
        });
        const inProgress = await Report.countDocuments({ 
            assignedTo: workerId, 
            status: 'In Progress' 
        });
        const acknowledged = await Report.countDocuments({ 
            assignedTo: workerId, 
            status: 'Acknowledged' 
        });

        // Calculate completion rate
        const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentActivity = await Report.find({
            assignedTo: workerId,
            updatedAt: { $gte: sevenDaysAgo }
        }).sort({ updatedAt: -1 }).limit(10);

        res.json({
            success: true,
            stats: {
                totalAssigned,
                completed,
                inProgress,
                acknowledged,
                completionRate,
                recentActivity
            }
        });
    } catch (err) {
        console.error('Get worker stats error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error fetching worker statistics' 
        });
    }
};

// @desc    Get task details
// @route   GET /api/worker/tasks/:id
exports.getTaskDetails = async (req, res) => {
    try {
        const task = await Report.findById(req.params.id)
            .populate('reportedBy', 'name email phone')
            .populate('assignedTo', 'name email');

        if (!task) {
            return res.status(404).json({ 
                success: false,
                msg: 'Task not found' 
            });
        }

        // Check if task is assigned to this worker
        if (task.assignedTo._id.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                msg: 'Access denied. Task not assigned to you.' 
            });
        }

        res.json({
            success: true,
            task
        });
    } catch (err) {
        console.error('Get task details error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error fetching task details' 
        });
    }
};