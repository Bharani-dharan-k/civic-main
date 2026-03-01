const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const Report = require('./models/Report');

const checkTaskAssignments = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('📊 CHECKING TASK ASSIGNMENTS FROM MUNICIPAL ADMIN TO DEPARTMENT HEADS');
        console.log('='.repeat(70));

        // Find all department heads
        const departmentHeads = await User.find({ role: 'department_head' });
        console.log(`\n✅ Found ${departmentHeads.length} department head(s)\n`);

        if (departmentHeads.length === 0) {
            console.log('❌ No department heads found in database!');
            console.log('💡 Create department heads first or check the role field\n');
        }

        // Check tasks assigned TO department heads (from municipal admin)
        for (const deptHead of departmentHeads) {
            console.log(`\n👤 DEPARTMENT HEAD: ${deptHead.name}`);
            console.log(`   Email: ${deptHead.email}`);
            console.log(`   Department: ${deptHead.department}`);
            console.log(`   Municipality: ${deptHead.municipality}`);
            console.log('-'.repeat(70));

            // Find tasks assigned to this department head
            const assignedTasks = await Task.find({
                assignedTo: deptHead._id
            }).populate('assignedBy', 'name email role')
              .populate('relatedReport', 'title description status category');

            console.log(`   📋 Tasks Assigned: ${assignedTasks.length}`);

            if (assignedTasks.length > 0) {
                assignedTasks.forEach((task, i) => {
                    console.log(`\n   ${i + 1}. ${task.title}`);
                    console.log(`      Status: ${task.status}`);
                    console.log(`      Priority: ${task.priority}`);
                    console.log(`      Assigned By: ${task.assignedBy?.name || 'Unknown'} (${task.assignedBy?.role || 'N/A'})`);
                    console.log(`      Department: ${task.department}`);
                    console.log(`      Municipality: ${task.municipality}`);
                    if (task.relatedReport) {
                        console.log(`      Related Report: ${task.relatedReport.title} (${task.relatedReport.status})`);
                    }
                    console.log(`      Created: ${task.createdAt.toLocaleString()}`);
                    if (task.deadline) {
                        console.log(`      Deadline: ${new Date(task.deadline).toLocaleString()}`);
                    }
                });
            } else {
                console.log('   ⚠️  No tasks found for this department head');
            }
        }

        // Check tasks created BY municipal admins
        console.log('\n\n📤 TASKS CREATED BY MUNICIPAL ADMINS:');
        console.log('='.repeat(70));

        const municipalAdmins = await User.find({ role: 'municipality_admin' });
        console.log(`\n✅ Found ${municipalAdmins.length} municipal admin(s)\n`);

        for (const admin of municipalAdmins) {
            const createdTasks = await Task.find({
                assignedBy: admin._id
            }).populate('assignedTo', 'name email role department');

            console.log(`\n👤 ${admin.name} (${admin.municipality})`);
            console.log(`   Tasks Created: ${createdTasks.length}`);

            if (createdTasks.length > 0) {
                createdTasks.forEach((task, i) => {
                    console.log(`   ${i + 1}. ${task.title}`);
                    console.log(`      Assigned To: ${task.assignedTo?.name || 'Unknown'} (${task.assignedTo?.role || 'N/A'})`);
                    console.log(`      Status: ${task.status}`);
                });
            }
        }

        // Summary Statistics
        console.log('\n\n📊 SUMMARY STATISTICS:');
        console.log('='.repeat(70));

        const totalTasks = await Task.countDocuments();
        const tasksToDeptheads = await Task.countDocuments({
            assignedTo: { $in: departmentHeads.map(d => d._id) }
        });
        const tasksByMunicipalAdmins = await Task.countDocuments({
            assignedBy: { $in: municipalAdmins.map(m => m._id) }
        });

        console.log(`\nTotal Tasks in Database: ${totalTasks}`);
        console.log(`Tasks Assigned to Department Heads: ${tasksToDeptheads}`);
        console.log(`Tasks Created by Municipal Admins: ${tasksByMunicipalAdmins}`);

        if (tasksToDeptheads === 0) {
            console.log('\n❌ NO TASKS ASSIGNED TO DEPARTMENT HEADS!');
            console.log('\n💡 TO FIX:');
            console.log('1. Go to Municipal Dashboard → Complaints tab');
            console.log('2. Click "Assign" on any complaint');
            console.log('3. Select a department admin from dropdown');
            console.log('4. Submit the assignment');
            console.log('5. A Task document should be created automatically');
        } else {
            console.log('\n✅ Tasks are being stored correctly!');
        }

        console.log('\n' + '='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

checkTaskAssignments();
