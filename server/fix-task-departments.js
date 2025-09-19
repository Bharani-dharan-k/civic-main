const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-connect', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Task = require('./models/Task');
const User = require('./models/User');

async function fixTaskDepartments() {
    try {
        console.log('🔧 Fixing task departments...\n');

        // Get all tasks without department
        const tasksWithoutDepartment = await Task.find({
            $or: [
                { department: null },
                { department: undefined },
                { department: "" },
                { department: { $exists: false } }
            ]
        }).populate('assignedBy', 'name department');

        console.log(`Found ${tasksWithoutDepartment.length} tasks without department assignment:\n`);

        for (let task of tasksWithoutDepartment) {
            if (task.assignedBy && task.assignedBy.department) {
                console.log(`Updating task "${task.title}"`);
                console.log(`  From: department = ${task.department || 'null'}`);
                console.log(`  To: department = ${task.assignedBy.department}`);
                
                task.department = task.assignedBy.department;
                await task.save();
                console.log(`  ✅ Updated successfully\n`);
            } else {
                console.log(`⚠️  Cannot update task "${task.title}" - no assignedBy department found\n`);
            }
        }

        // Verify the fixes
        console.log('🔍 Verification - Tasks by department:');
        const tasksByDepartment = await Task.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                    tasks: { $push: '$title' }
                }
            }
        ]);

        tasksByDepartment.forEach(dept => {
            console.log(`\n📁 Department: ${dept._id || 'Not Set'}`);
            console.log(`   Count: ${dept.count}`);
            dept.tasks.forEach(title => {
                console.log(`   - ${title}`);
            });
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixTaskDepartments();