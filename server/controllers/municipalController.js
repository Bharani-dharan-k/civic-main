// Add a new staff member to the municipality
exports.addStaffMember = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const currentUser = await require('../models/User').findById(new mongoose.Types.ObjectId(req.user.id));
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const municipality = currentUser.municipality;
        const { name, email, phone, role, department, password } = req.body;
        if (!name || !email || !role) {
            return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
        }
        
        // Use provided password or default
        const staffPassword = password || '123456';
        // Check if user already exists
        const User = require('../models/User');
        let existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'User with this email already exists' });
        }
        // Prepare new user data. Some fields are required by schema depending on role
        const newUserData = {
            name,
            email,
            phone,
            role,
            department,
            municipality,
            district: currentUser.district, // ensure district is set
            createdBy: currentUser._id,
            password: staffPassword, // Use provided password or default
            isActive: true
        };

        // Only set adminRole when role is one of admin roles
        const adminRoles = ['super_admin', 'district_admin', 'municipality_admin', 'department_head', 'field_head'];
        if (adminRoles.includes(role)) {
            // For department_head or field_head the adminRole is the same as role
            newUserData.adminRole = role;
        } else {
            // Ensure adminRole is not set for plain field_staff
            delete newUserData.adminRole;
        }

    // Debug: log new user data (without password)
    console.log('🔧 Creating new staff with data:', { ...newUserData, password: '***' });
    // Create new staff user
    const newUser = new User(newUserData);
        await newUser.save();
        res.json({ success: true, message: 'Staff member added', data: { _id: newUser._id, name, email, role, department } });
    } catch (error) {
        console.error('Add staff member error:', error);
        res.status(500).json({ success: false, message: 'Failed to add staff member', error: error.message });
    }
};

// Update a staff member
exports.updateStaffMember = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { name, email, phone, role, department, isActive, password } = req.body;
        
        const mongoose = require('mongoose');
        const currentUser = await require('../models/User').findById(new mongoose.Types.ObjectId(req.user.id));
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const User = require('../models/User');
        const staffMember = await User.findById(staffId);
        if (!staffMember) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }
        
        // Check if staff member belongs to same municipality
        if (staffMember.municipality !== currentUser.municipality) {
            return res.status(403).json({ success: false, message: 'You can only update staff from your municipality' });
        }
        
        // Update fields if provided
        if (name) staffMember.name = name;
        if (email) staffMember.email = email;
        if (phone !== undefined) staffMember.phone = phone;
        if (role) staffMember.role = role;
        if (department) staffMember.department = department;
        if (isActive !== undefined) staffMember.isActive = isActive;
        if (password && password.trim() !== '') {
            staffMember.password = password; // The User model should hash this automatically
        }
        
        await staffMember.save();
        
        res.json({
            success: true,
            message: 'Staff member updated successfully',
            data: {
                _id: staffMember._id,
                name: staffMember.name,
                email: staffMember.email,
                phone: staffMember.phone,
                role: staffMember.role,
                department: staffMember.department,
                isActive: staffMember.isActive
            }
        });
    } catch (error) {
        console.error('Update staff member error:', error);
        res.status(500).json({ success: false, message: 'Failed to update staff member', error: error.message });
    }
};

// Delete a staff member
exports.deleteStaffMember = async (req, res) => {
    try {
        const { staffId } = req.params;
        
        const mongoose = require('mongoose');
        const currentUser = await require('../models/User').findById(new mongoose.Types.ObjectId(req.user.id));
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const User = require('../models/User');
        const staffMember = await User.findById(staffId);
        if (!staffMember) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }
        
        // Check if staff member belongs to same municipality
        if (staffMember.municipality !== currentUser.municipality) {
            return res.status(403).json({ success: false, message: 'You can only delete staff from your municipality' });
        }
        
        // Instead of deleting, mark as inactive (soft delete)
        staffMember.isActive = false;
        await staffMember.save();
        
        res.json({
            success: true,
            message: 'Staff member deleted successfully'
        });
    } catch (error) {
        console.error('Delete staff member error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete staff member', error: error.message });
    }
};
// Assign a task or report to a staff member
exports.assignTask = async (req, res) => {
    try {
        const { itemId, staffId } = req.body;
        if (!itemId || !staffId) {
            return res.status(400).json({ success: false, message: 'itemId and staffId are required' });
        }

        let updatedItem = null;
        let itemType = 'task';

        if (itemId.startsWith('report_')) {
            // Assigning a report
            const reportId = itemId.substring(7);
            const report = await Report.findById(reportId);
            if (!report) {
                return res.status(404).json({ success: false, message: 'Report not found' });
            }
            report.assignedTo = staffId.toString();
            await report.save();
            updatedItem = report;
            itemType = 'report';
        } else {
            // Assigning a traditional task
            const task = await Task.findById(itemId);
            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }
            task.assignedTo = staffId;
            await task.save();
            updatedItem = task;
        }

        res.json({
            success: true,
            message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} assigned to staff successfully`,
            data: updatedItem
        });
    } catch (error) {
        console.error('❌ Error assigning task/report to staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign task/report to staff',
            error: error.message
        });
    }
};
const Report = require('../models/Report');
const User = require('../models/User');
const Task = require('../models/Task');

// Get municipal dashboard statistics
exports.getMunicipalStats = async (req, res) => {
    try {
        console.log('🏛️ Getting municipal stats for user:', req.user);
        
        // Get the current municipality admin's details - try JWT first, fallback to database
        let municipality = req.user.municipality;
        let assignedWard = req.user.ward;
        
        // If not in JWT, fetch from database
        if (!municipality) {
            const currentUser = await User.findById(req.user.id);
            if (!currentUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            municipality = currentUser.municipality;
            assignedWard = currentUser.ward;
        }
        console.log('📍 Municipality:', municipality, 'Ward:', assignedWard);

        // Build query filters - if ward is assigned, filter by ward, otherwise all municipality
        // Reports use 'urbanLocalBody' field to store municipality info
        let reportQuery = { urbanLocalBody: municipality };
        if (assignedWard) {
            reportQuery.ward = assignedWard;
        }

        console.log('🔍 Query being executed:', JSON.stringify(reportQuery));

        // Get reports for this municipality admin's assigned ward
        const municipalReports = await Report.find(reportQuery);
        
        // Debug: Show first few reports if any found
        if (municipalReports.length > 0) {
            console.log('📋 Sample reports found:');
            municipalReports.slice(0, 2).forEach((report, index) => {
                console.log(`   ${index + 1}. "${report.title}" - ${report.status}`);
                console.log(`      urbanLocalBody: "${report.urbanLocalBody}"`);
                console.log(`      ward: "${report.ward}"`);
            });
        } else {
            console.log('❌ No reports found with query:', JSON.stringify(reportQuery));
        }

        console.log(`📊 Found ${municipalReports.length} reports for ${municipality}${assignedWard ? ` - Ward: ${assignedWard}` : ''}`);

        // Calculate statistics
        const totalComplaints = municipalReports.length;
        const resolvedComplaints = municipalReports.filter(r => r.status === 'resolved').length;
        const pendingComplaints = municipalReports.filter(r => r.status === 'pending' || r.status === 'submitted').length;
        const inProgressComplaints = municipalReports.filter(r => r.status === 'in_progress' || r.status === 'assigned').length;

        // Get staff count for this municipality/ward
        let staffQuery = { municipality: municipality, role: { $in: ['field_staff', 'field_head', 'department_head'] } };
        const staffCount = await User.countDocuments(staffQuery);

        // Calculate active projects (reports currently being worked on)
        const activeProjects = inProgressComplaints;

        const stats = {
            totalComplaints,
            resolvedComplaints,
            pendingComplaints,
            inProgressComplaints,
            staffCount,
            activeProjects,
            assignedWard,
            municipality,
            budget: 1500000, // Mock budget - can be made dynamic
            resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0
        };

        console.log('📊 Municipal stats:', stats);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('❌ Error getting municipal stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get municipal statistics',
            error: error.message
        });
    }
};

// Get service requests for the municipality
exports.getServiceRequests = async (req, res) => {
    try {
        console.log('🛠️ Getting service requests for user:', req.user);
        
        // Get the current municipality admin's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const municipality = currentUser.municipality;
        const assignedWard = currentUser.ward;
        
        // Get service-related reports for this municipality/ward
        const serviceCategories = ['maintenance', 'electrical', 'plumbing', 'cleaning', 'drainage', 'pothole', 'streetlight', 'garbage'];
        
        let reportQuery = {
            municipality: municipality,
            category: { $in: serviceCategories }
        };
        
        if (assignedWard) {
            reportQuery.ward = assignedWard;
        }

        const serviceRequests = await Report.find(reportQuery)
          .populate('reportedBy', 'name email phone')
          .sort({ createdAt: -1 })
          .limit(50);

        console.log(`🛠️ Found ${serviceRequests.length} service requests for ${municipality}${assignedWard ? ` - Ward: ${assignedWard}` : ''}`);

        res.json({
            success: true,
            data: serviceRequests
        });

    } catch (error) {
        console.error('❌ Error getting service requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get service requests',
            error: error.message
        });
    }
};

// Get emergency alerts for the municipality
exports.getEmergencyAlerts = async (req, res) => {
    try {
        console.log('🚨 Getting emergency alerts for user:', req.user);
        
        // Get the current municipality admin's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const municipality = currentUser.municipality;
        const assignedWard = currentUser.ward;
        
        // Build query for emergency alerts
        let alertQuery = {
            municipality: municipality,
            priority: { $in: ['High', 'Critical'] },
            status: { $in: ['pending', 'submitted', 'acknowledged', 'assigned', 'in_progress'] }
        };
        
        if (assignedWard) {
            alertQuery.ward = assignedWard;
        }

        const emergencyAlerts = await Report.find(alertQuery)
          .populate('reportedBy', 'name phone')
          .sort({ createdAt: -1 })
          .limit(20);

        // Transform reports into alert format
        const alerts = emergencyAlerts.map(report => ({
            _id: report._id,
            title: report.title,
            message: report.description,
            type: report.category,
            severity: report.priority.toLowerCase(),
            location: report.location,
            address: report.address,
            ward: report.ward,
            timestamp: report.createdAt,
            citizen: report.reportedBy,
            status: report.status
        }));

        console.log(`🚨 Found ${alerts.length} emergency alerts for ${municipality}${assignedWard ? ` - Ward: ${assignedWard}` : ''}`);

        res.json({
            success: true,
            data: alerts
        });

    } catch (error) {
        console.error('❌ Error getting emergency alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get emergency alerts',
            error: error.message
        });
    }
};

// Get municipal reports (citizen complaints)
exports.getMunicipalReports = async (req, res) => {
    try {
        console.log('📋 Getting municipal reports for user:', req.user);
        
        // Get the current municipality admin's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const municipality = currentUser.municipality;
        const assignedWard = currentUser.ward;
        
        console.log(`🏛️ Municipality from user: "${municipality}"`);
        console.log(`🏠 Assigned ward: "${assignedWard}"`);
        
        // Reports use 'urbanLocalBody' field to store municipality info
        let reportQuery = { urbanLocalBody: municipality };
        if (assignedWard) {
            reportQuery.ward = assignedWard;
        }
        
        console.log('🔍 Query for reports:', reportQuery);

        // Get all reports for this municipality admin's assigned area
        const reports = await Report.find(reportQuery)
          .populate('reportedBy', 'name email phone')
          .populate('assignedTo', 'name email')
          .sort({ createdAt: -1 });

        console.log(`📋 Found ${reports.length} reports for ${municipality}${assignedWard ? ` - Ward: ${assignedWard}` : ''}`);

        res.json({
            success: true,
            data: reports
        });

    } catch (error) {
        console.error('❌ Error getting municipal reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get municipal reports',
            error: error.message
        });
    }
};

// Get municipal staff
exports.getMunicipalStaff = async (req, res) => {
    try {
        console.log('👥 Getting municipal staff for user:', req.user);
        
        // Get the current municipality admin's municipality
        const mongoose = require('mongoose');
        const currentUser = await User.findById(new mongoose.Types.ObjectId(req.user.id));
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const municipality = currentUser.municipality;
        
        // Get staff for this municipality
        const staff = await User.find({
            municipality: municipality,
            role: { $in: ['field_staff', 'field_head', 'department_head'] }
        }).select('name email phone role department municipality isActive points badges createdAt');

        console.log(`👥 Found ${staff.length} staff members for ${municipality}`);

        res.json({
            success: true,
            data: staff
        });

    } catch (error) {
        console.error('❌ Error getting municipal staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get municipal staff',
            error: error.message
        });
    }
};

// Update report status (for municipality admin)
exports.updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, notes } = req.body;

        console.log(`🔄 Updating report ${reportId} status to ${status}`);

        // Get the current municipality admin's municipality
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find the report and ensure it belongs to this municipality
        const report = await Report.findOne({
            _id: reportId,
            municipality: currentUser.municipality
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found or not authorized'
            });
        }

        // Update the report
        report.status = status;
        if (notes) {
            if (!report.adminNotes) report.adminNotes = [];
            report.adminNotes.push({
                admin: req.user.id,
                note: notes,
                timestamp: new Date()
            });
        }
        report.updatedAt = new Date();

        await report.save();

        console.log(`✅ Report ${reportId} status updated to ${status}`);

        res.json({
            success: true,
            message: 'Report status updated successfully',
            data: report
        });

    } catch (error) {
        console.error('❌ Error updating report status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update report status',
            error: error.message
        });
    }
};

// Get assigned tasks for municipal admin
exports.getAssignedTasks = async (req, res) => {
    try {
        console.log('📋 Getting assigned tasks for municipal admin:', req.user);
        console.log('📋 Request user details:', JSON.stringify(req.user, null, 2));

        // Get the current municipality admin's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            console.log('❌ Current user not found with ID:', req.user.id);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('👤 Current user found:', {
            id: currentUser._id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role
        });

        // Get both tasks and assigned reports
        const [assignedTasks, assignedReports] = await Promise.all([
            // Get traditional tasks assigned to this municipal admin
            Task.find({
                assignedTo: currentUser._id
            }).populate('assignedBy', 'name email role')
              .populate('relatedReport', 'title category status location address')
              .sort({ createdAt: -1 }),
            
            // Get reports assigned to this municipal admin (these are work assignments)
            Report.find({
                assignedTo: currentUser._id.toString(), // Reports store assignedTo as string
                status: { $in: ['assigned', 'in_progress', 'acknowledged'] }
            }).populate('reportedBy', 'name email phone')
              .sort({ createdAt: -1 })
        ]);

        console.log(`🔍 Found ${assignedTasks.length} traditional tasks and ${assignedReports.length} assigned reports`);

        // Convert assigned reports to task format for unified display
        const reportTasks = assignedReports.map(report => ({
            _id: `report_${report._id}`, // Prefix to distinguish from real tasks
            title: report.title,
            description: report.description,
            priority: report.priority || 'Medium',
            status: report.status === 'assigned' ? 'assigned' : 
                   report.status === 'in_progress' ? 'in_progress' : 'acknowledged',
            assignedBy: {
                name: 'District Admin', // Reports don't have assignedBy populated
                role: 'district_admin'
            },
            department: report.category || 'General',
            createdAt: report.createdAt,
            deadline: null, // Reports don't have deadlines
            notes: report.adminNotes || [],
            relatedReport: {
                _id: report._id,
                title: report.title,
                category: report.category,
                status: report.status,
                location: report.location,
                address: report.address,
                imageUrl: report.imageUrl
            },
            reportedBy: report.reportedBy,
            type: 'report' // Flag to identify report-based tasks
        }));

        // Combine tasks and report-tasks
        const allAssignedWork = [...assignedTasks, ...reportTasks];
        
        console.log(`📋 Total work assignments for ${currentUser.name}: ${allAssignedWork.length}`);
        
        if (allAssignedWork.length > 0) {
            console.log('📋 Work assignment details:');
            allAssignedWork.forEach((task, index) => {
                console.log(`  ${index + 1}. ${task.title} (Status: ${task.status}, Type: ${task.type || 'task'})`);
            });
        }

        res.json({
            success: true,
            data: allAssignedWork
        });

    } catch (error) {
        console.error('❌ Error getting assigned tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get assigned tasks',
            error: error.message
        });
    }
};

// Update task progress
exports.updateTaskProgress = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, notes } = req.body;

        console.log(`🔄 Updating task/report ${taskId} progress to ${status}`);

        // Get the current municipality admin's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let updatedItem = null;
        let itemType = 'task';

        // Check if this is a report (has "report_" prefix) or a traditional task
        if (taskId.startsWith('report_')) {
            // This is a report - extract the real report ID and update in Report collection
            const actualReportId = taskId.substring(7); // Remove "report_" prefix
            itemType = 'report';

            console.log(`📝 Updating report: ${actualReportId}`);

            // Find the report and ensure it's assigned to this user
            const report = await Report.findOne({
                _id: actualReportId,
                assignedTo: currentUser._id.toString()
            });

            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found or not assigned to you'
                });
            }

            // Update the report status
            report.status = status;
            
            // Add notes if provided
            if (notes) {
                if (!report.notes) report.notes = [];
                report.notes.push({
                    text: notes,
                    addedBy: req.user.id,
                    addedAt: new Date()
                });
            }

            // Set resolution date if report is resolved
            if (status === 'resolved' && !report.resolvedAt) {
                report.resolvedAt = new Date();
            }

            await report.save();

            // Populate the updated report for response
            updatedItem = await Report.findById(actualReportId)
                .populate('assignedBy', 'name email role')
                .populate('reportedBy', 'name email phone');

            // Convert report to task format for consistent response
            updatedItem = {
                _id: `report_${updatedItem._id}`,
                title: updatedItem.title || updatedItem.description,
                description: updatedItem.description,
                status: updatedItem.status,
                priority: updatedItem.priority,
                assignedBy: updatedItem.assignedBy,
                reportedBy: updatedItem.reportedBy,
                createdAt: updatedItem.createdAt,
                updatedAt: updatedItem.updatedAt,
                resolvedAt: updatedItem.resolvedAt,
                type: 'report',
                category: updatedItem.category,
                location: updatedItem.location,
                notes: updatedItem.notes
            };

        } else {
            // This is a traditional task
            console.log(`📋 Updating traditional task: ${taskId}`);

            // Find the task and ensure it's assigned to this user
            const task = await Task.findOne({
                _id: taskId,
                assignedTo: currentUser._id
            });

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found or not assigned to you'
                });
            }

            // Update the task
            task.status = status;
            if (notes) {
                if (!task.notes) task.notes = [];
                task.notes.push({
                    text: notes,
                    addedBy: req.user.id,
                    addedAt: new Date()
                });
            }

            // Set completion date if task is completed
            if (status === 'completed' && !task.completedAt) {
                task.completedAt = new Date();
            }

            await task.save();

            // Populate the updated task for response
            updatedItem = await Task.findById(taskId)
                .populate('assignedBy', 'name email role')
                .populate('relatedReport', 'title category status location address');
        }

        console.log(`✅ ${itemType} ${taskId} status updated to ${status}`);

        res.json({
            success: true,
            message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} progress updated successfully`,
            data: updatedItem
        });

    } catch (error) {
        console.error('❌ Error updating task/report progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task progress',
            error: error.message
        });
    }
};

// Get task statistics for municipal admin
exports.getTaskStats = async (req, res) => {
    try {
        console.log('📊 Getting task statistics for municipal admin:', req.user);

        // Get the current municipality admin's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get statistics for both tasks and assigned reports
        const [taskStats, reportStats] = await Promise.all([
            // Traditional task statistics
            Promise.all([
                Task.countDocuments({ assignedTo: currentUser._id }),
                Task.countDocuments({ assignedTo: currentUser._id, status: 'completed' }),
                Task.countDocuments({ assignedTo: currentUser._id, status: 'in_progress' }),
                Task.countDocuments({ assignedTo: currentUser._id, status: 'assigned' }),
                Task.countDocuments({
                    assignedTo: currentUser._id,
                    deadline: { $lt: new Date() },
                    status: { $nin: ['completed', 'cancelled'] }
                })
            ]),
            
            // Report assignment statistics
            Promise.all([
                Report.countDocuments({ 
                    assignedTo: currentUser._id.toString(),
                    status: { $in: ['assigned', 'in_progress', 'acknowledged'] }
                }),
                Report.countDocuments({ 
                    assignedTo: currentUser._id.toString(),
                    status: 'resolved'
                }),
                Report.countDocuments({ 
                    assignedTo: currentUser._id.toString(),
                    status: 'in_progress'
                }),
                Report.countDocuments({ 
                    assignedTo: currentUser._id.toString(),
                    status: { $in: ['assigned', 'acknowledged'] }
                })
            ])
        ]);

        const [taskTotal, taskCompleted, taskInProgress, taskAssigned, taskOverdue] = taskStats;
        const [reportTotal, reportCompleted, reportInProgress, reportAssigned] = reportStats;

        // Combine statistics
        const combinedStats = {
            totalTasks: taskTotal + reportTotal,
            completedTasks: taskCompleted + reportCompleted,
            inProgressTasks: taskInProgress + reportInProgress,
            assignedTasks: taskAssigned + reportAssigned,
            overdueTasks: taskOverdue, // Only tasks have deadlines
            taskBreakdown: {
                traditionalTasks: taskTotal,
                assignedReports: reportTotal
            },
            completionRate: (taskTotal + reportTotal) > 0 ? 
                Math.round(((taskCompleted + reportCompleted) / (taskTotal + reportTotal)) * 100) : 0
        };

        console.log('📊 Combined task statistics:', combinedStats);

        res.json({
            success: true,
            data: combinedStats
        });

    } catch (error) {
        console.error('❌ Error getting task statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get task statistics',
            error: error.message
        });
    }
};

// Get municipal infrastructure status
exports.getInfrastructureStatus = async (req, res) => {
    try {
        console.log('🏗️ Getting infrastructure status for user:', req.user);
        
        // Get the current municipality admin's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const municipality = currentUser.municipality;
        const assignedWard = currentUser.ward;
        
        console.log('📍 Getting infrastructure for municipality:', municipality, 'Ward:', assignedWard);

        // Build query for infrastructure reports/projects
        // Reports use 'urbanLocalBody' field to store municipality info
        let projectQuery = { urbanLocalBody: municipality };
        if (assignedWard) {
            projectQuery.ward = assignedWard;
        }

        // Get infrastructure-related reports
        const infrastructureReports = await Report.find({
            ...projectQuery,
            category: { $in: ['infrastructure', 'roads', 'streetlights', 'water', 'drainage', 'sewage'] }
        });

        // Calculate infrastructure statistics
        const totalProjects = infrastructureReports.length;
        const activeProjects = infrastructureReports.filter(r => r.status === 'in_progress' || r.status === 'assigned').length;
        const completedProjects = infrastructureReports.filter(r => r.status === 'resolved').length;
        const maintenanceRequests = infrastructureReports.filter(r => r.priority === 'high' || r.priority === 'urgent').length;

        // Get project details from reports
        const recentProjects = infrastructureReports
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(report => ({
                id: report._id,
                name: report.title || report.description,
                status: report.status === 'resolved' ? 'completed' : 
                       report.status === 'in_progress' || report.status === 'assigned' ? 'active' : 'planning',
                progress: report.status === 'resolved' ? 100 : 
                         report.status === 'in_progress' ? 60 : 
                         report.status === 'assigned' ? 30 : 10,
                budget: 1000000, // Default budget - this could be enhanced with real budget data
                startDate: report.createdAt,
                expectedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
                location: report.location || `Ward ${report.ward || assignedWard || 'N/A'}`,
                category: report.category
            }));

        // Infrastructure facility statistics (municipality-wide estimates)
        const facilities = [
            { name: 'Water Treatment Plants', total: 5, operational: 4, maintenance: 1 },
            { name: 'Sewage Treatment Plants', total: 3, operational: 3, maintenance: 0 },
            { name: 'Public Parks', total: 15, operational: Math.max(0, 15 - maintenanceRequests), maintenance: Math.min(maintenanceRequests, 15) },
            { name: 'Street Lights', total: 1250, operational: Math.max(0, 1250 - (maintenanceRequests * 10)), maintenance: Math.min(maintenanceRequests * 10, 1250) },
            { name: 'Public Transport Stops', total: 45, operational: Math.max(0, 45 - Math.floor(maintenanceRequests / 2)), maintenance: Math.min(Math.floor(maintenanceRequests / 2), 45) }
        ];

        const infrastructureStatus = {
            totalProjects,
            activeProjects,
            completedProjects,
            maintenanceRequests,
            budgetUtilized: Math.round((completedProjects / Math.max(totalProjects, 1)) * 100),
            upcomingProjects: Math.floor(totalProjects * 0.2), // Estimate 20% are upcoming
            facilities,
            recentProjects
        };

        console.log('🏗️ Infrastructure status:', infrastructureStatus);

        res.json({
            success: true,
            data: infrastructureStatus
        });

    } catch (error) {
        console.error('❌ Error getting infrastructure status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get infrastructure status',
            error: error.message
        });
    }
};

// Get municipal finance data
exports.getFinanceData = async (req, res) => {
    try {
        console.log('💰 Getting finance data for user:', req.user);
        
        // Get the current municipality admin's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const municipality = currentUser.municipality;
        const assignedWard = currentUser.ward;
        
        console.log('📍 Getting finance data for municipality:', municipality, 'Ward:', assignedWard);

        // Build query for reports (which represent financial activities)
        // Reports use 'urbanLocalBody' field to store municipality info
        let reportQuery = { urbanLocalBody: municipality };
        if (assignedWard) {
            reportQuery.ward = assignedWard;
        }

        // Get all reports for budget calculations
        const allReports = await Report.find(reportQuery);
        const completedReports = allReports.filter(r => r.status === 'resolved');
        
        // Calculate base budget allocation based on municipality size and reports
        const baseBudget = municipality === 'Ranchi' ? 125000000 : 
                          municipality === 'Jamshedpur' ? 100000000 : 
                          municipality === 'Dhanbad' ? 80000000 : 50000000;

        // Calculate budget utilization based on completed projects
        const budgetUsed = Math.floor(baseBudget * 0.7); // Assume 70% utilization
        const budgetRemaining = baseBudget - budgetUsed;
        
        // Monthly estimates
        const monthlyRevenue = Math.floor(baseBudget * 0.08); // 8% monthly revenue
        const monthlyExpenses = Math.floor(baseBudget * 0.06); // 6% monthly expenses

        // Department allocations (percentage-based)
        const departments = [
            { name: 'Health Services', allocated: Math.floor(baseBudget * 0.20), used: Math.floor(baseBudget * 0.15), remaining: Math.floor(baseBudget * 0.05) },
            { name: 'Infrastructure', allocated: Math.floor(baseBudget * 0.28), used: Math.floor(baseBudget * 0.23), remaining: Math.floor(baseBudget * 0.05) },
            { name: 'Education', allocated: Math.floor(baseBudget * 0.18), used: Math.floor(baseBudget * 0.16), remaining: Math.floor(baseBudget * 0.02) },
            { name: 'Sanitation', allocated: Math.floor(baseBudget * 0.14), used: Math.floor(baseBudget * 0.12), remaining: Math.floor(baseBudget * 0.02) },
            { name: 'Public Works', allocated: Math.floor(baseBudget * 0.12), used: Math.floor(baseBudget * 0.10), remaining: Math.floor(baseBudget * 0.02) },
            { name: 'Transportation', allocated: Math.floor(baseBudget * 0.08), used: Math.floor(baseBudget * 0.06), remaining: Math.floor(baseBudget * 0.02) }
        ];

        // Recent transactions (based on recent reports)
        const recentTransactions = allReports
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map((report, index) => ({
                id: report._id,
                date: report.createdAt,
                description: `${report.category} - ${report.title || report.description}`,
                amount: report.status === 'resolved' ? -Math.floor(Math.random() * 500000 + 100000) : -Math.floor(Math.random() * 200000 + 50000),
                type: 'expense',
                department: report.category || 'General'
            }));

        // Monthly trends (sample data based on activity)
        const currentMonth = new Date().getMonth();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyTrends = [];
        
        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const monthName = monthNames[monthIndex];
            const revenue = monthlyRevenue + Math.floor(Math.random() * 500000 - 250000);
            const expenses = monthlyExpenses + Math.floor(Math.random() * 300000 - 150000);
            
            monthlyTrends.push({
                month: monthName,
                revenue,
                expenses,
                balance: revenue - expenses
            });
        }

        const financeData = {
            totalBudget: baseBudget,
            budgetUsed,
            budgetRemaining,
            monthlyRevenue,
            monthlyExpenses,
            departments,
            recentTransactions,
            monthlyTrends,
            budgetUtilization: Math.round((budgetUsed / baseBudget) * 100),
            savingsRate: Math.round(((monthlyRevenue - monthlyExpenses) / monthlyRevenue) * 100)
        };

        console.log('💰 Finance data:', { ...financeData, recentTransactions: `${financeData.recentTransactions.length} transactions` });

        res.json({
            success: true,
            data: financeData
        });

    } catch (error) {
        console.error('❌ Error getting finance data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get finance data',
            error: error.message
        });
    }
};

// Get department admins in the municipality
exports.getDepartmentAdmins = async (req, res) => {
    try {
        console.log('👥 Getting department admins for user:', req.user);
        
        // Get the current municipality admin's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const municipality = currentUser.municipality;
        
        console.log('📍 Getting department admins for municipality:', municipality);

        // Get all department heads in this municipality
        const departmentAdmins = await User.find({
            municipality: municipality,
            role: 'department_head',
            isActive: true
        }).select('name email department phone municipality ward createdAt');

        console.log(`👥 Found ${departmentAdmins.length} department admins in ${municipality}`);

        res.json({
            success: true,
            data: departmentAdmins
        });

    } catch (error) {
        console.error('❌ Error getting department admins:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get department admins',
            error: error.message
        });
    }
};

// Assign report to department admin
exports.assignReportToDepartmentAdmin = async (req, res) => {
    try {
        console.log('📋 Assigning report to department admin:', req.body);
        
        const { reportId, departmentAdminId, priority, notes } = req.body;
        const currentUser = await User.findById(req.user.id);
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate report exists and belongs to this municipality
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        if (report.municipality !== currentUser.municipality) {
            return res.status(403).json({
                success: false,
                message: 'Report does not belong to your municipality'
            });
        }

        // Validate department admin exists and is in same municipality
        const departmentAdmin = await User.findById(departmentAdminId);
        if (!departmentAdmin || departmentAdmin.municipality !== currentUser.municipality || departmentAdmin.role !== 'department_head') {
            return res.status(400).json({
                success: false,
                message: 'Invalid department admin or not in same municipality'
            });
        }

        // Create assignment record
        const Task = require('../models/Task');
        const newTask = new Task({
            title: `Report Assignment: ${report.title || report.description}`,
            description: notes || `Assigned report from ${report.location || 'municipality'} for resolution`,
            assignedTo: departmentAdminId,
            assignedBy: currentUser._id,
            relatedReport: reportId,
            municipality: currentUser.municipality,
            ward: report.ward || currentUser.ward,
            department: departmentAdmin.department,
            priority: priority || report.priority || 'medium',
            status: 'assigned',
            deadline: req.body.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
            createdAt: new Date(),
            notes: notes
        });

        await newTask.save();

        // Update the report status and assignment
        report.assignedTo = departmentAdminId;
        report.status = 'assigned';
        report.priority = priority || report.priority;
        await report.save();

        // Populate the assignment data for response
        await newTask.populate([
            { path: 'assignedTo', select: 'name email department' },
            { path: 'assignedBy', select: 'name email' },
            { path: 'relatedReport', select: 'title description location category' }
        ]);

        console.log('✅ Report assigned successfully:', {
            taskId: newTask._id,
            reportId: reportId,
            departmentAdmin: departmentAdmin.name,
            department: departmentAdmin.department
        });

        res.json({
            success: true,
            message: 'Report assigned to department admin successfully',
            data: {
                task: newTask,
                report: report
            }
        });

    } catch (error) {
        console.error('❌ Error assigning report to department admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign report to department admin',
            error: error.message
        });
    }
};

// Get municipal projects data
exports.getProjectsData = async (req, res) => {
    try {
        console.log('🏗️ Getting projects data for user:', req.user);
        
        // Get the current municipality admin's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const municipality = currentUser.municipality;
        const assignedWard = currentUser.ward;
        
        console.log('📍 Getting projects for municipality:', municipality, 'Ward:', assignedWard);

        // Build query for project reports
        // Reports use 'urbanLocalBody' field to store municipality info
        let projectQuery = { urbanLocalBody: municipality };
        if (assignedWard) {
            projectQuery.ward = assignedWard;
        }

        // Get project-related reports (infrastructure, development, etc.)
        const projectReports = await Report.find({
            ...projectQuery,
            category: { $in: ['infrastructure', 'roads', 'streetlights', 'water', 'drainage', 'sewage', 'parks', 'public_transport'] }
        }).populate('assignedTo', 'name email');

        // Transform reports into project format
        const projects = projectReports.map(report => {
            const startDate = report.createdAt;
            const deadline = new Date(startDate);
            deadline.setDate(deadline.getDate() + 90); // Default 90-day deadline

            return {
                _id: report._id,
                name: report.title || report.description,
                status: report.status === 'resolved' ? 'completed' : 
                       report.status === 'in_progress' || report.status === 'assigned' ? 'active' : 
                       report.status === 'pending' ? 'planning' : 'on_hold',
                progress: report.status === 'resolved' ? 100 : 
                         report.status === 'in_progress' ? Math.floor(Math.random() * 40 + 40) : 
                         report.status === 'assigned' ? Math.floor(Math.random() * 30 + 10) : 0,
                budget: Math.floor(Math.random() * 2000000 + 500000), // Random budget between 5L-25L
                spent: Math.floor(Math.random() * 1000000 + 200000),
                startDate: startDate,
                deadline: deadline,
                contractor: report.assignedTo ? report.assignedTo.name : 'Municipal Department',
                location: report.location || `Ward ${report.ward || assignedWard || 'N/A'}`,
                category: report.category,
                priority: report.priority,
                description: report.description,
                ward: report.ward || assignedWard
            };
        });

        // Add some additional project statistics
        const activeProjects = projects.filter(p => p.status === 'active').length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const plannedProjects = projects.filter(p => p.status === 'planning').length;
        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);

        const projectsSummary = {
            total: projects.length,
            active: activeProjects,
            completed: completedProjects,
            planned: plannedProjects,
            totalBudget,
            totalSpent,
            budgetUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
            projects: projects.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)) // Sort by latest first
        };

        console.log('🏗️ Projects summary:', { 
            total: projectsSummary.total, 
            active: projectsSummary.active, 
            completed: projectsSummary.completed,
            budgetUtilization: projectsSummary.budgetUtilization 
        });

        res.json({
            success: true,
            data: projectsSummary
        });

    } catch (error) {
        console.error('❌ Error getting projects data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get projects data',
            error: error.message
        });
    }
};