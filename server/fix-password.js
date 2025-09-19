const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app');
        console.log('Connected to MongoDB...');

        const correctHash = bcrypt.hashSync('password123', 10);
        console.log('Correct hash:', correctHash);
        
        // Direct MongoDB update
        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: 'rajesh@example.com' },
            { $set: { password: correctHash } }
        );
        
        console.log('Update result:', result);
        
        // Verify the update
        const user = await mongoose.connection.db.collection('users').findOne({ email: 'rajesh@example.com' });
        console.log('Updated user password:', user.password);
        
        // Test password
        const isMatch = await bcrypt.compare('password123', user.password);
        console.log('Password test:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

fixPassword();