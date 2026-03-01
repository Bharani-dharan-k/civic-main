const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const Report = require('./models/Report');

const testCompleteFlow = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🧪 TESTING COMPLETE ASSIGN FLOW');
        console.log('='.repeat(70));

        // 1. Find a municipal admin (Bhupesh)
        const municipalAdmin = await User.findOne({ email: 'bhupesh@gmail.com' });
        if (!municipalAdmin) {
            console.log('❌ Bhupesh not found!');
            return;
        }

        console.log(`\n✅ Municipal Admin Found: ${municipalAdmin.name}`);
        console.log(`   Municipality: ${municipalAdmin.municipality}`);

        // 2. Find a department head in same municipality
        const departmentHead = await User.findOne({ 
            role: 'department_head',
            municipality: municipalAdmin.municipality
        });

        if (!departmentHead) {
            console.log(`❌ No department head found for ${municipalAdmin.municipality}`);
            return;
        }

        console.log(`\n✅ Department Head Found: ${departmentHead.name}`);
        console.log(`   Department: ${departmentHead.department}`);
        console.log(`   Municipality: ${departmentHead.municipality}`);

        // 3. Find a report in that municipality
        const report = await Report.findOne({
            urbanLocalBody: municipalAdmin.municipality,
            status: { $nin: ['assigned', 'resolved'] }
        });

        if (!report) {
            console.log(`❌ No unassigned reports found for ${municipalAdmin.municipality}`);
            return;
        }

        console.log(`\n✅ Report Found: ${report.title}`);
        console.log(`   Municipality: ${report.urbanLocalBody}`);
        console.log(`   Current Status: ${report.status}`);

        // 4. Simulate the assignment (what the backend does)
        console.log('\n📋 SIMULATING ASSIGNMENT...');
        console.log('-'.repeat(70));

        // Check if urbanLocalBody matches
        if (report.urbanLocalBody !== municipalAdmin.municipality) {
            console.log(`❌ MISMATCH DETECTED!`);
            console.log(`   Report urbanLocalBody: "${report.urbanLocalBody}"`);
            console.log(`   Admin municipality: "${municipalAdmin.municipality}"`);
            console.log('   This would cause assignment to FAIL!');
            return;
        } else {
            console.log(`✅ Municipality Match: "${report.urbanLocalBody}"`);
        }

        // Create the task
        const newTask = new Task({
            title: `Report Assignment: ${report.title}`,
            description: `Assigned report for resolution - TEST ASSIGNMENT`,
            assignedTo: departmentHead._id,
            assignedBy: municipalAdmin._id,
            relatedReport: report._id,
            municipality: municipalAdmin.municipality,
            ward: report.ward || municipalAdmin.ward,
            department: departmentHead.department,
            priority: 'high',
            status: 'assigned',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date()
        });

        await newTask.save();
        console.log(`✅ Task Created: ${newTask._id}`);

        // Update report
        report.assignedTo = departmentHead._id.toString();
        report.status = 'assigned';
        await report.save();
        console.log(`✅ Report Updated: assignedTo = ${departmentHead.name}`);

        // 5. Verify - Check what department head will see
        console.log('\n📊 VERIFICATION:');
        console.log('='.repeat(70));

        const deptHeadTasks = await Task.find({
            $or: [
                { assignedTo: departmentHead._id },
                { department: departmentHead.department }
            ]
        }).populate('assignedBy', 'name email')
          .populate('relatedReport', 'title status');

        console.log(`\n👤 ${departmentHead.name} will see:`);
        console.log(`   Total Tasks: ${deptHeadTasks.length}`);
        
        if (deptHeadTasks.length > 0) {
            deptHeadTasks.forEach((task, i) => {
                console.log(`\n   ${i + 1}. ${task.title}`);
                console.log(`      Status: ${task.status}`);
                console.log(`      Assigned By: ${task.assignedBy?.name || 'Unknown'}`);
                console.log(`      Department: ${task.department}`);
                if (task.relatedReport) {
                    console.log(`      Related Report: ${task.relatedReport.title} (${task.relatedReport.status})`);
                }
            });
        }

        // Check what municipal admin's "Assigned Tasks" page shows
        const municipalTasks = await Task.find({
            assignedTo: municipalAdmin._id
        });

        const municipalAssignedReports = await Report.find({
            assignedTo: municipalAdmin._id.toString(),
            status: { $in: ['assigned', 'in_progress', 'acknowledged'] }
        });

        console.log(`\n👤 ${municipalAdmin.name}'s "Assigned Tasks" page will show:`);
        console.log(`   Tasks: ${municipalTasks.length}`);
        console.log(`   Assigned Reports: ${municipalAssignedReports.length}`);
        console.log(`   Total: ${municipalTasks.length + municipalAssignedReports.length}`);

        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST COMPLETE\n');
        console.log('💡 SUMMARY:');
        console.log(`   1. Created task assigned to ${departmentHead.name}`);
        console.log(`   2. Updated report status to 'assigned'`);
        console.log(`   3. Department Head dashboard will show ${deptHeadTasks.length} task(s)`);
        console.log('\n📌 IMPORTANT: The "Assigned Tasks" tab in Municipal Dashboard shows');
        console.log('   tasks assigned TO the municipal admin, not tasks they created.');
        console.log('   Tasks they assign to department heads won\'t appear there.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

testCompleteFlow();
