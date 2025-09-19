const mongoose = require('mongoose');
require('dotenv').config();

const getRealUserId = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app');
        console.log('Connected to MongoDB...');

        const user = await mongoose.connection.db.collection('users').findOne({ email: 'rajesh@example.com' });
        if (user) {
            console.log('Real user ID:', user._id.toString());
            console.log('User name:', user.name);
            console.log('User email:', user.email);
        } else {
            console.log('User not found');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

getRealUserId();