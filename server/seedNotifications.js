const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

const seedNotifications = async () => {
    try {
        // Find admin users
        const adminUsers = await User.find({ role: 'admin' });
        
        if (adminUsers.length === 0) {
            console.log('No admin users found. Please seed admin users first.');
            return;
        }

        const adminUser = adminUsers[0];

        // Sample notifications
        const notifications = [
            {
                userId: adminUser._id,
                title: 'New Issue Reported',
                message: 'A new water supply issue has been reported in Sector 12. Immediate attention required.',
                type: 'report_update',
                priority: 'high',
                read: false
            },
            {
                userId: adminUser._id,
                title: 'System Maintenance',
                message: 'Scheduled maintenance will be performed tonight from 2 AM to 4 AM.',
                type: 'system',
                priority: 'medium',
                read: false
            },
            {
                userId: adminUser._id,
                title: 'Issue Resolved',
                message: 'Road repair work in Zone A has been completed successfully.',
                type: 'completion',
                priority: 'low',
                read: true
            },
            {
                userId: adminUser._id,
                title: 'Worker Assignment',
                message: 'Worker John Doe has been assigned to drainage issue #1234.',
                type: 'assignment',
                priority: 'medium',
                read: false
            },
            {
                userId: adminUser._id,
                title: 'Monthly Report Available',
                message: 'Your monthly analytics report is ready for download.',
                type: 'system',
                priority: 'low',
                read: false
            }
        ];

        // Clear existing notifications for demo purposes
        await Notification.deleteMany({ userId: adminUser._id });
        
        // Insert new notifications
        await Notification.insertMany(notifications);
        
        console.log('✅ Sample notifications seeded successfully!');
        console.log(`📬 Created ${notifications.length} notifications for admin user`);
        
    } catch (error) {
        console.error('❌ Error seeding notifications:', error.message);
    }
};

// Run if called directly
if (require.main === module) {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('Connected to MongoDB...');
        seedNotifications().then(() => {
            mongoose.connection.close();
        });
    });
}

module.exports = seedNotifications;
