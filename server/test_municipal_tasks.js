const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const Report = require('./models/Report');

const testTasks = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-portal');
        console.log('✅ Connected to MongoDB\n');

        console.log('📋 TESTING ASSIGNED TASKS FOR MUNICIPAL ADMINS');
        console.log('='.repeat(60));

        // Get all municipal admins
        const municipalAdmins = await User.find({ role: 'municipality_admin' });
        
        if (municipalAdmins.length === 0) {
            console.log('❌ No municipal admins found!');
            return;
        }

        console.log(`✅ Found ${municipalAdmins.length} municipal admin(s)\n`);

        for (const admin of municipalAdmins) {
            console.log(`\n👤 CHECKING: ${admin.name} (${admin.email})`);
            console.log('   Municipality:', admin.municipality);
            console.log('   Ward:', admin.ward || 'Not assigned');
            console.log('-'.repeat(60));

            // Check traditional tasks
            const tasks = await Task.find({
                assignedTo: admin._id
            }).populate('assignedBy', 'name email')
              .populate('relatedReport', 'title status');

            console.log(`   📌 Traditional Tasks: ${tasks.length}`);
            if (tasks.length > 0) {
                tasks.forEach((task, i) => {
                    console.log(`      ${i + 1}. ${task.title}`);
                    console.log(`         Status: ${task.status}`);
                    console.log(`         Assigned by: ${task.assignedBy?.name || 'Unknown'}`);
                });
            }

            // Check assigned reports (work assignments)
            const assignedReports = await Report.find({
                assignedTo: admin._id.toString(),
                status: { $in: ['assigned', 'in_progress', 'acknowledged'] }
            });

            console.log(`\n   📋 Assigned Reports (as tasks): ${assignedReports.length}`);
            if (assignedReports.length > 0) {
                assignedReports.forEach((report, i) => {
                    console.log(`      ${i + 1}. ${report.title}`);
                    console.log(`         Status: ${report.status}`);
                    console.log(`         Municipality: ${report.urbanLocalBody}`);
                    console.log(`         Assigned To ID: ${report.assignedTo}`);
                });
            }

            const totalWork = tasks.length + assignedReports.length;
            console.log(`\n   📊 TOTAL WORK ITEMS: ${totalWork}`);

            if (totalWork === 0) {
                console.log('   ⚠️  WARNING: No tasks or reports assigned to this admin!');
                console.log('   💡 FIX OPTIONS:');
                console.log('      1. Create a task assigned to this user');
                console.log('      2. Assign a report to this user (assignedTo field)');
                console.log(`      3. Run: db.tasks.insertOne({
                    title: "Test Task for ${admin.name}",
                    description: "Sample task",
                    assignedTo: ObjectId("${admin._id}"),
                    assignedBy: ObjectId("${admin._id}"),
                    status: "assigned",
                    priority: "medium",
                    department: "General"
                })`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ TASK CHECK COMPLETE\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

testTasks();
