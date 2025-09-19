const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-connect', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Task = require('./models/Task');
const User = require('./models/User');

async function checkTasks() {
    try {
        console.log('🔍 Checking all tasks in database...\n');

        // Get all tasks
        const allTasks = await Task.find({})
            .populate('assignedTo', 'name email role')
            .populate('assignedBy', 'name email role');

        console.log(`Found ${allTasks.length} total tasks in database:\n`);

        allTasks.forEach((task, index) => {
            console.log(`Task ${index + 1}:`);
            console.log(`  ID: ${task._id}`);
            console.log(`  Title: ${task.title}`);
            console.log(`  Status: ${task.status}`);
            console.log(`  Department: ${task.department || 'Not set'}`);
            console.log(`  Assigned To: ${task.assignedTo ? task.assignedTo.name : 'Not assigned'}`);
            console.log(`  Assigned By: ${task.assignedBy ? task.assignedBy.name : 'Not set'}`);
            console.log(`  Created: ${task.createdAt}`);
            console.log('  ---');
        });

        // Check specific user (Dharun)
        console.log('\n🔍 Checking Dharun user details...');
        const dharunUser = await User.findOne({ email: 'dharun@gmail.com' });
        if (dharunUser) {
            console.log(`Dharun User ID: ${dharunUser._id}`);
            console.log(`Dharun Role: ${dharunUser.role}`);
            console.log(`Dharun Department: ${dharunUser.department || 'Not set'}`);

            // Check tasks assigned to Dharun's department
            const departmentTasks = await Task.find({ department: dharunUser.department })
                .populate('assignedTo', 'name email')
                .populate('assignedBy', 'name email');

            console.log(`\n🎯 Tasks in Dharun's department (${dharunUser.department || 'general'}):`);
            console.log(`Found ${departmentTasks.length} tasks`);

            departmentTasks.forEach((task, index) => {
                console.log(`  ${index + 1}. ${task.title} - Status: ${task.status}`);
            });

            // Check tasks assigned directly to Dharun
            const tasksAssignedToDharun = await Task.find({ assignedTo: dharunUser._id })
                .populate('assignedBy', 'name email');

            console.log(`\n👤 Tasks directly assigned to Dharun:`);
            console.log(`Found ${tasksAssignedToDharun.length} tasks`);

            tasksAssignedToDharun.forEach((task, index) => {
                console.log(`  ${index + 1}. ${task.title} - Status: ${task.status}`);
            });
        } else {
            console.log('❌ Dharun user not found!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTasks();