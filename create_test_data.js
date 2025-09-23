/**
 * Simple test to create data and verify our endpoints
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const User = require('./server/models/User');
const Report = require('./server/models/Report');
const Task = require('./server/models/Task');

async function createTestData() {
    try {
        console.log('🔍 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        console.log('\n🔍 Finding Bhupesh...');
        const bhupesh = await User.findOne({ email: 'bhupesh@gmail.com' });
        
        if (!bhupesh) {
            console.log('❌ Bhupesh not found!');
            return;
        }
        
        console.log('✅ Bhupesh found:', bhupesh.name, '- ID:', bhupesh._id);
        
        // Create a test report assigned to Bhupesh
        console.log('\n📝 Creating test report assigned to Bhupesh...');
        const testReport = new Report({
            title: 'Test Pothole Report - Assigned to Bhupesh',
            description: 'A test pothole that needs fixing in Ward 1',
            category: 'Infrastructure',
            priority: 'medium',
            status: 'assigned',
            location: {
                coordinates: [85.3644, 23.6693],
                address: 'Test Street, Ward 1, Bokaro'
            },
            citizenId: bhupesh._id, // Using bhupesh as citizen for simplicity
            assignedTo: bhupesh._id.toString(), // String format for assignedTo
            assignedBy: bhupesh._id // ObjectId format for assignedBy
        });
        
        await testReport.save();
        console.log('✅ Test report created:', testReport._id);
        
        // Create a test task assigned to Bhupesh
        console.log('\n📝 Creating test task assigned to Bhupesh...');
        const testTask = new Task({
            title: 'Test Municipal Task',
            description: 'Test task for municipal admin',
            priority: 'high',
            status: 'assigned',
            assignedTo: bhupesh._id, // ObjectId format for tasks
            assignedBy: bhupesh._id,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            department: 'Public Works'
        });
        
        await testTask.save();
        console.log('✅ Test task created:', testTask._id);
        
        // Now test our controller logic manually
        console.log('\n🔍 Testing task/report queries...');
        
        // Test traditional tasks
        const tasks = await Task.find({ assignedTo: bhupesh._id })
            .populate('assignedBy', 'name email')
            .lean();
        console.log(`📋 Traditional tasks found: ${tasks.length}`);
        
        // Test assigned reports 
        const reports = await Report.find({ 
            assignedTo: bhupesh._id.toString() 
        }).populate('assignedBy', 'name email').lean();
        console.log(`📋 Assigned reports found: ${reports.length}`);
        
        // Combine and convert reports to task format
        const convertedReports = reports.map(report => ({
            _id: `report_${report._id}`,
            title: report.title || report.description,
            description: report.description,
            status: report.status,
            priority: report.priority,
            assignedBy: report.assignedBy,
            createdAt: report.createdAt,
            type: 'report',
            category: report.category,
            location: report.location
        }));
        
        const combinedTasks = [...tasks, ...convertedReports];
        console.log(`📋 Total combined tasks/reports: ${combinedTasks.length}`);
        
        combinedTasks.forEach((task, index) => {
            console.log(`${index + 1}. ${task.title}`);
            console.log(`   Type: ${task.type || 'task'}`);
            console.log(`   Status: ${task.status}`);
            console.log(`   Priority: ${task.priority}`);
        });
        
        await mongoose.disconnect();
        console.log('\n✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestData();