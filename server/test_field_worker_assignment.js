const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const Report = require('./models/Report');

const testFieldWorkerAssignment = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🧪 TESTING DEPARTMENT HEAD → FIELD WORKER ASSIGNMENT');
        console.log('='.repeat(70));

        // 1. Find Dharun (department head) and the task assigned to him
        const dharun = await User.findOne({ email: 'dharun@gmail.com' });
        if (!dharun) {
            console.log('❌ Dharun not found!');
            return;
        }

        console.log(`\n✅ Department Head: ${dharun.name}`);
        console.log(`   Department: ${dharun.department}`);
        console.log(`   Municipality: ${dharun.municipality}`);

        // Find task assigned to Dharun
        const dharunTask = await Task.findOne({ 
            assignedTo: dharun._id 
        }).populate('relatedReport', 'title');

        if (!dharunTask) {
            console.log('❌ No task found for Dharun!');
            console.log('💡 Run test_assign_flow.js first to create a task');
            return;
        }

        console.log(`\n✅ Task Found: ${dharunTask.title}`);
        console.log(`   Status: ${dharunTask.status}`);
        console.log(`   Priority: ${dharunTask.priority}`);

        // 2. Find a field worker in same department/municipality
        const fieldWorker = await User.findOne({
            role: 'field_staff',
            department: dharun.department,
            municipality: dharun.municipality
        });

        if (!fieldWorker) {
            console.log(`\n❌ No field worker found in ${dharun.department} department`);
            console.log('💡 Creating a test field worker...');
            
            // Create a field worker
            const newFieldWorker = new User({
                name: 'Test Field Worker',
                email: 'field.worker@test.com',
                password: 'password123',
                role: 'field_staff',
                department: dharun.department,
                municipality: dharun.municipality,
                district: dharun.district || 'Bokaro',
                phone: '+91-9876543210'
            });
            await newFieldWorker.save();
            console.log(`✅ Created field worker: ${newFieldWorker.name}`);
            
            var assignedWorker = newFieldWorker;
        } else {
            console.log(`\n✅ Field Worker Found: ${fieldWorker.name}`);
            console.log(`   Department: ${fieldWorker.department}`);
            console.log(`   Municipality: ${fieldWorker.municipality}`);
            var assignedWorker = fieldWorker;
        }

        // 3. Simulate the assignment (what the backend API does)
        console.log('\n📋 ASSIGNING TASK TO FIELD WORKER...');
        console.log('-'.repeat(70));

        const fieldWorkerTask = new Task({
            title: dharunTask.title,
            description: `Field assignment: ${dharunTask.description}`,
            assignedTo: assignedWorker._id,
            assignedBy: dharun._id,
            relatedReport: dharunTask.relatedReport,
            municipality: dharunTask.municipality || dharun.municipality,
            ward: dharunTask.ward,
            department: dharun.department,
            priority: dharunTask.priority,
            status: 'assigned',
            deadline: dharunTask.deadline,
            parentTask: dharunTask._id,
            createdAt: new Date()
        });

        await fieldWorkerTask.save();
        console.log(`✅ Task Created for Field Worker: ${fieldWorkerTask._id}`);

        // Update original task status
        dharunTask.status = 'in_progress';
        await dharunTask.save();
        console.log(`✅ Dharun's task updated to 'in_progress'`);

        // 4. Verification
        console.log('\n📊 VERIFICATION:');
        console.log('='.repeat(70));

        // What Dharun will see
        const dharunTasks = await Task.find({
            $or: [
                { assignedTo: dharun._id },
                { department: dharun.department }
            ]
        }).populate('assignedBy', 'name');

        console.log(`\n👤 ${dharun.name} (Department Head) will see:`);
        console.log(`   Total Tasks: ${dharunTasks.length}`);
        dharunTasks.forEach((task, i) => {
            console.log(`   ${i + 1}. ${task.title} - Status: ${task.status}`);
        });

        // What field worker will see
        const workerTasks = await Task.find({
            assignedTo: assignedWorker._id
        }).populate('assignedBy', 'name')
          .populate('parentTask', 'title')
          .populate('relatedReport', 'title');

        console.log(`\n👤 ${assignedWorker.name} (Field Worker) will see:`);
        console.log(`   Total Tasks: ${workerTasks.length}`);
        workerTasks.forEach((task, i) => {
            console.log(`\n   ${i + 1}. ${task.title}`);
            console.log(`      Status: ${task.status}`);
            console.log(`      Assigned By: ${task.assignedBy?.name || 'Unknown'}`);
            console.log(`      Priority: ${task.priority}`);
            if (task.parentTask) {
                console.log(`      Parent Task: ${task.parentTask.title}`);
            }
            if (task.relatedReport) {
                console.log(`      Related Report: ${task.relatedReport.title}`);
            }
        });

        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST COMPLETE\n');
        console.log('💡 SUMMARY:');
        console.log(`   1. Dharun's task updated to 'in_progress'`);
        console.log(`   2. Created sub-task for ${assignedWorker.name}`);
        console.log(`   3. Field worker will see 1 assigned task`);
        console.log('\n📌 API Endpoint: POST /api/department-head/tasks/:taskId/assign');
        console.log('   Body: { fieldWorkerId, notes, priority }');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

testFieldWorkerAssignment();
