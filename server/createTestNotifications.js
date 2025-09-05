const mongoose = require('mongoose');
const NotificationService = require('./utils/notificationService');
const User = require('./models/User');
require('dotenv').config();

async function createTestNotifications() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app');
        console.log('Connected to MongoDB...');

        // Find or create a test citizen user
        let citizen = await User.findOne({ role: 'citizen' });
        
        if (!citizen) {
            console.log('No citizen user found. Creating a test user...');
            citizen = new User({
                name: 'Test Citizen',
                email: 'test@citizen.com',
                password: 'hashedpassword',
                phone: '+91-9999999999',
                role: 'citizen',
                points: 0
            });
            await citizen.save();
            console.log('Test citizen created:', citizen.name);
        }

        console.log('Creating test notifications for user:', citizen.name);

        // Create different types of notifications
        await NotificationService.notifySystem(
            citizen._id,
            'Welcome to SevaTrack!',
            'Thank you for joining SevaTrack. Start reporting issues in your area to make your community better.',
            'high'
        );

        await NotificationService.notifyPointsEarned(
            citizen._id,
            5,
            'Welcome bonus for joining SevaTrack!'
        );

        await NotificationService.notifySystem(
            citizen._id,
            'New Feature Available',
            'You can now track the real-time status of your reports and see when workers are assigned.',
            'medium'
        );

        await NotificationService.notifySystem(
            citizen._id,
            'System Maintenance',
            'Scheduled maintenance will occur tonight from 2 AM to 4 AM. Service may be temporarily unavailable.',
            'low'
        );

        console.log('✅ Test notifications created successfully!');
        console.log('You can now log in as a citizen to see the notifications.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test notifications:', error.message);
        process.exit(1);
    }
}

createTestNotifications();
