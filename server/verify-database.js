const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const Report = require('./models/Report');
const Staff = require('./models/Staff');
require('dotenv').config();

async function verifyDatabaseAndCollections() {
    console.log('🔍 Verifying Database and Collections...\n');

    try {
        // Connect to database
        console.log('1. Connecting to database...');
        console.log('MongoDB URI:', process.env.MONGO_URI);
        
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to MongoDB');
        console.log('Database Name:', mongoose.connection.db.databaseName);
        console.log('Connection State:', mongoose.connection.readyState);
        console.log('Host:', mongoose.connection.host);
        console.log('Port:', mongoose.connection.port);
        console.log();

        // List all collections
        console.log('2. Listing all collections in the database...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections found:');
        collections.forEach(col => {
            console.log(`  - ${col.name}`);
        });
        console.log();

        // Check Users collection
        console.log('3. Checking Users collection...');
        const totalUsers = await User.countDocuments();
        const departmentHeads = await User.countDocuments({ role: 'department_head' });
        console.log(`Total users: ${totalUsers}`);
        console.log(`Department heads: ${departmentHeads}`);
        
        // Find Dharun specifically
        const dharun = await User.findOne({ email: 'dharun@gmail.com' });
        if (dharun) {
            console.log('✅ Dharun found:');
            console.log(`  - ID: ${dharun._id}`);
            console.log(`  - Name: ${dharun.name}`);
            console.log(`  - Email: ${dharun.email}`);
            console.log(`  - Role: ${dharun.role}`);
            console.log(`  - Department: ${dharun.department}`);
            console.log(`  - Municipality: ${dharun.municipality}`);
            console.log(`  - District: ${dharun.district}`);
        } else {
            console.log('❌ Dharun not found in users collection');
        }
        console.log();

        // Check Tasks collection
        console.log('4. Checking Tasks collection...');
        const totalTasks = await Task.countDocuments();
        const dharunTasks = await Task.countDocuments({ department: 'Health Services' });
        console.log(`Total tasks: ${totalTasks}`);
        console.log(`Health Services department tasks: ${dharunTasks}`);
        
        if (dharunTasks > 0) {
            console.log('Sample Health Services tasks:');
            const sampleTasks = await Task.find({ department: 'Health Services' })
                .populate('assignedTo', 'name email')
                .populate('assignedBy', 'name email')
                .limit(5);
            
            sampleTasks.forEach((task, index) => {
                console.log(`  ${index + 1}. ${task.title}`);
                console.log(`     Status: ${task.status}`);
                console.log(`     Priority: ${task.priority}`);
                console.log(`     Assigned to: ${task.assignedTo?.name || 'Unassigned'}`);
                console.log(`     Assigned by: ${task.assignedBy?.name || 'Unknown'}`);
                console.log(`     Department: ${task.department}`);
            });
        }
        console.log();

        // Check Staff collection
        console.log('5. Checking Staff collection...');
        const totalStaff = await Staff.countDocuments();
        const healthServicesStaff = await Staff.countDocuments({ department: 'Health Services' });
        console.log(`Total staff: ${totalStaff}`);
        console.log(`Health Services department staff: ${healthServicesStaff}`);
        
        if (healthServicesStaff > 0) {
            console.log('Health Services staff:');
            const staffMembers = await Staff.find({ department: 'Health Services' })
                .populate('user', 'name email phone')
                .limit(5);
            
            staffMembers.forEach((staff, index) => {
                console.log(`  ${index + 1}. ${staff.user?.name || 'Unknown'}`);
                console.log(`     Position: ${staff.position}`);
                console.log(`     Status: ${staff.status}`);
                console.log(`     Employee ID: ${staff.employeeId}`);
            });
        }
        console.log();

        // Check Reports collection
        console.log('6. Checking Reports collection...');
        const totalReports = await Report.countDocuments();
        const assignedReports = await Report.countDocuments({ assignedTo: dharun?._id });
        console.log(`Total reports: ${totalReports}`);
        console.log(`Reports assigned to Dharun: ${assignedReports}`);
        console.log();

        // Check specific collections by name
        console.log('7. Checking collection document counts...');
        for (const collection of collections) {
            try {
                const count = await mongoose.connection.db.collection(collection.name).countDocuments();
                console.log(`  ${collection.name}: ${count} documents`);
            } catch (error) {
                console.log(`  ${collection.name}: Error counting - ${error.message}`);
            }
        }
        console.log();

        // Check indexes
        console.log('8. Checking indexes...');
        try {
            const userIndexes = await User.collection.getIndexes();
            console.log('User collection indexes:', Object.keys(userIndexes));
            
            const taskIndexes = await Task.collection.getIndexes();
            console.log('Task collection indexes:', Object.keys(taskIndexes));
        } catch (error) {
            console.log('Error getting indexes:', error.message);
        }

        console.log('\n✅ Database verification complete!');

    } catch (error) {
        console.error('❌ Error during database verification:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
    }
}

verifyDatabaseAndCollections();