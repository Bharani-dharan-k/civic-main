const Notification = require('../models/Notification');

class NotificationService {
    // Create a new notification
    static async createNotification(userId, title, message, type = 'system', relatedReport = null, priority = 'medium') {
        try {
            const notification = new Notification({
                userId,
                title,
                message,
                type,
                relatedReport,
                priority
            });

            await notification.save();
            console.log('Notification created:', { userId, title, type });
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    // Create report status update notification
    static async notifyReportStatusUpdate(userId, reportTitle, newStatus, reportId) {
        const statusMessages = {
            'acknowledged': 'Your report has been acknowledged by the administration.',
            'assigned': 'Your report has been assigned to a field worker.',
            'in_progress': 'Work has started on your report.',
            'resolved': 'Your report has been resolved successfully.',
            'rejected': 'Your report has been rejected. Please contact support for more details.',
            'closed': 'Your report has been closed.'
        };

        const title = `Report Status Update`;
        const message = `"${reportTitle}" - ${statusMessages[newStatus] || 'Status has been updated.'}`;
        
        return this.createNotification(userId, title, message, 'report_update', reportId, 'high');
    }

    // Create worker assignment notification
    static async notifyWorkerAssignment(userId, reportTitle, workerName, reportId) {
        const title = 'Worker Assigned';
        const message = `Your report "${reportTitle}" has been assigned to ${workerName}.`;
        
        return this.createNotification(userId, title, message, 'assignment', reportId, 'medium');
    }

    // Create points earned notification
    static async notifyPointsEarned(userId, points, reason) {
        const title = 'Points Earned!';
        const message = `You earned ${points} points! ${reason}`;
        
        return this.createNotification(userId, title, message, 'points', null, 'medium');
    }

    // Create system notification
    static async notifySystem(userId, title, message, priority = 'low') {
        return this.createNotification(userId, title, message, 'system', null, priority);
    }

    // Get user notifications
    static async getUserNotifications(userId, limit = 20) {
        try {
            const notifications = await Notification.find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('relatedReport', 'title')
                .lean();

            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    // Mark notification as read
    static async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId },
                { read: true },
                { new: true }
            );
            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return null;
        }
    }

    // Mark all notifications as read for a user
    static async markAllAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { userId, read: false },
                { read: true }
            );
            return result;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return null;
        }
    }

    // Get unread count
    static async getUnreadCount(userId) {
        try {
            const count = await Notification.countDocuments({ userId, read: false });
            return count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    // Delete old notifications (cleanup task)
    static async cleanupOldNotifications(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            const result = await Notification.deleteMany({
                createdAt: { $lt: cutoffDate }
            });
            
            console.log(`Cleaned up ${result.deletedCount} old notifications`);
            return result;
        } catch (error) {
            console.error('Error cleaning up notifications:', error);
            return null;
        }
    }
}

module.exports = NotificationService;
