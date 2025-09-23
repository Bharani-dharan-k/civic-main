const mongoose = require('mongoose');
const User = require('./server/models/User');
const Task = require('./server/models/Task');

// Connect to database
mongoose.connect('mongodb://localhost:27017/newcivic', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const debugTaskAssignment = async () => {
    try {
        console.log('🔍 Debugging task assignment issue...\n');

        // Find Bhupesh
        const bhupesh = await User.findOne({ email: 'bhupesh@gmail.com' });
        if (!bhupesh) {
            console.log('❌ Bhupesh not found! Creating user first...');
            return;
        }

        console.log('👤 Bhupesh Details:');
        console.log(`   Name: ${bhupesh.name}`);
        console.log(`   Email: ${bhupesh.email}`);
        console.log(`   Role: ${bhupesh.role}`);
        console.log(`   Municipality: ${bhupesh.municipality}`);
        console.log(`   Ward: ${bhupesh.ward}`);
        console.log(`   User ID: ${bhupesh._id}`);

        // Check all tasks assigned to Bhupesh
        const allTasksForBhupesh = await Task.find({ assignedTo: bhupesh._id })
            .populate('assignedBy', 'name email role')
            .populate('relatedReport', 'title category');

        console.log(`\n📋 Tasks assigned to Bhupesh (Total: ${allTasksForBhupesh.length}):`);
        if (allTasksForBhupesh.length > 0) {
            allTasksForBhupesh.forEach((task, index) => {
                console.log(`   ${index + 1}. ${task.title}`);
                console.log(`      Status: ${task.status}`);
                console.log(`      Priority: ${task.priority}`);
                console.log(`      Assigned by: ${task.assignedBy?.name || 'Unknown'} (${task.assignedBy?.role || 'Unknown role'})`);
                console.log(`      Created: ${task.createdAt}`);
                if (task.deadline) console.log(`      Deadline: ${task.deadline}`);
                console.log('');
            });
        } else {
            console.log('   No tasks found assigned to Bhupesh!');
        }

        // Check all tasks in the system
        const allTasks = await Task.find({})
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email role');

        console.log(`\n📊 All tasks in system (Total: ${allTasks.length}):`);
        if (allTasks.length > 0) {
            allTasks.forEach((task, index) => {
                console.log(`   ${index + 1}. ${task.title}`);
                console.log(`      Assigned to: ${task.assignedTo?.name || 'Unknown'} (${task.assignedTo?.email || 'No email'})`);
                console.log(`      Assigned by: ${task.assignedBy?.name || 'Unknown'} (${task.assignedBy?.role || 'Unknown role'})`);
                console.log(`      Status: ${task.status}`);
                console.log('');
            });
        } else {
            console.log('   No tasks found in the system!');
        }

        // Check district admins
        const districtAdmins = await User.find({ role: 'district_admin' });
        console.log(`\n👨‍💼 District Admins (Total: ${districtAdmins.length}):`);
        districtAdmins.forEach((admin, index) => {
            console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - District: ${admin.district}`);
        });

        // Check municipal admins
        const municipalAdmins = await User.find({ role: 'municipality_admin' });
        console.log(`\n🏛️ Municipal Admins (Total: ${municipalAdmins.length}):`);
        municipalAdmins.forEach((admin, index) => {
            console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - Municipality: ${admin.municipality}, Ward: ${admin.ward}`);
        });

        // Test the API query that municipal dashboard would use
        console.log('\n🔬 Testing municipal dashboard query...');
        const taskQuery = { assignedTo: bhupesh._id };
        console.log('Query:', JSON.stringify(taskQuery));
        
        const queryResult = await Task.find(taskQuery)
            .populate('assignedBy', 'name email role')
            .populate('relatedReport', 'title category status location address')
            .sort({ createdAt: -1 });

        console.log(`Query result: ${queryResult.length} tasks found`);
        queryResult.forEach((task, index) => {
            console.log(`   ${index + 1}. ${task.title} (${task.status})`);
        });

    } catch (error) {
        console.error('❌ Error debugging task assignment:', error);
    } finally {
        mongoose.connection.close();
    }
};

debugTaskAssignment();