/**
 * Simple check of the database to understand the current state
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Simple schema definitions
const UserSchema = new mongoose.Schema({}, { strict: false });
const ReportSchema = new mongoose.Schema({}, { strict: false });
const TaskSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', UserSchema);
const Report = mongoose.model('Report', ReportSchema);
const Task = mongoose.model('Task', TaskSchema);

async function checkDatabase() {
    try {
        console.log('🔍 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Check Bhupesh user
        console.log('\n👤 Checking Bhupesh user...');
        const bhupesh = await User.findOne({ email: 'bhupesh@gmail.com' });
        if (bhupesh) {
            console.log('✅ Bhupesh found:');
            console.log(`   ID: ${bhupesh._id}`);
            console.log(`   Name: ${bhupesh.name}`);
            console.log(`   Email: ${bhupesh.email}`);
            console.log(`   Role: ${bhupesh.role}`);
            console.log(`   Municipality: ${bhupesh.municipality}`);
            console.log(`   Ward: ${bhupesh.ward}`);
            
            // Check tasks assigned to Bhupesh
            console.log('\n📋 Checking tasks assigned to Bhupesh...');
            const tasks = await Task.find({ assignedTo: bhupesh._id });
            console.log(`   Found ${tasks.length} tasks`);
            tasks.forEach((task, index) => {
                console.log(`   ${index + 1}. ${task.title} (${task.status})`);
            });
            
            // Check reports assigned to Bhupesh
            console.log('\n📄 Checking reports assigned to Bhupesh...');
            const reports = await Report.find({ assignedTo: bhupesh._id.toString() });
            console.log(`   Found ${reports.length} reports (checking with string ID)`);
            reports.forEach((report, index) => {
                console.log(`   ${index + 1}. ${report.title} (${report.status})`);
            });
            
            // Also check with ObjectId format
            const reportsObj = await Report.find({ assignedTo: bhupesh._id });
            console.log(`   Found ${reportsObj.length} reports (checking with ObjectId)`);
            reportsObj.forEach((report, index) => {
                console.log(`   ${index + 1}. ${report.title} (${report.status})`);
            });
            
        } else {
            console.log('❌ Bhupesh user not found!');
        }
        
        // Check total reports in system
        console.log('\n📊 Database summary:');
        const totalUsers = await User.countDocuments();
        const totalReports = await Report.countDocuments();
        const totalTasks = await Task.countDocuments();
        
        console.log(`   Total Users: ${totalUsers}`);
        console.log(`   Total Reports: ${totalReports}`);
        console.log(`   Total Tasks: ${totalTasks}`);
        
        // Show some sample reports
        console.log('\n📄 Sample reports (first 3):');
        const sampleReports = await Report.find().limit(3);
        sampleReports.forEach((report, index) => {
            console.log(`   ${index + 1}. "${report.title}" - Status: ${report.status} - AssignedTo: ${report.assignedTo}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkDatabase();