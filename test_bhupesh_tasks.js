const mongoose = require('mongoose');
const User = require('./server/models/User');
const Task = require('./server/models/Task');
const Report = require('./server/models/Report');
const bcrypt = require('bcryptjs');

// Connect to database
mongoose.connect('mongodb://localhost:27017/newcivic', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const createTestUserAndTasks = async () => {
    try {
        console.log('🎯 Creating test user Bhupesh and assigning tasks...');

        // Hash password for bhupesh
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create or update Bhupesh as municipal admin
        let bhupesh = await User.findOne({ email: 'bhupesh@gmail.com' });
        if (!bhupesh) {
            bhupesh = new User({
                name: 'Bhupesh Kumar',
                email: 'bhupesh@gmail.com',
                password: hashedPassword,
                role: 'municipality_admin',
                adminRole: 'municipality_admin',
                district: 'Bangalore Urban',
                municipality: 'BBMP',
                ward: 'Ward-12',
                phone: '+91-9876543210',
                department: 'Municipal Services',
                isActive: true
            });
        } else {
            // Update existing user
            bhupesh.role = 'municipality_admin';
            bhupesh.adminRole = 'municipality_admin';
            bhupesh.district = 'Bangalore Urban';
            bhupesh.municipality = 'BBMP';
            bhupesh.ward = 'Ward-12';
            bhupesh.department = 'Municipal Services';
        }

        await bhupesh.save();
        console.log('✅ Created/Updated Bhupesh Kumar as Municipal Admin for Ward-12');

        // Create a district admin who will assign tasks
        let districtAdmin = await User.findOne({ email: 'district.admin@gov.in' });
        if (!districtAdmin) {
            districtAdmin = new User({
                name: 'District Administrator',
                email: 'district.admin@gov.in',
                password: await bcrypt.hash('admin123', 10),
                role: 'district_admin',
                adminRole: 'district_admin',
                district: 'Bangalore Urban',
                phone: '+91-9876543200',
                isActive: true
            });
            await districtAdmin.save();
            console.log('✅ Created District Admin');
        }

        // Create some test reports that tasks will be related to
        const testReport1 = new Report({
            title: 'Pothole on Ward-12 Main Street',
            description: 'Large pothole causing traffic issues on main street',
            category: 'pothole',
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            address: 'Main Street, Ward-12, BBMP',
            ward: 'Ward-12',
            district: 'Bangalore Urban',
            municipality: 'BBMP',
            urbanLocalBody: 'BBMP',
            imageUrl: 'https://example.com/pothole.jpg',
            status: 'acknowledged',
            priority: 'High',
            reportedBy: bhupesh._id
        });

        const testReport2 = new Report({
            title: 'Streetlights not working in Ward-12',
            description: 'Multiple streetlights are not functioning in residential area',
            category: 'streetlight',
            location: { type: 'Point', coordinates: [77.5950, 12.9720] },
            address: 'Gandhi Nagar, Ward-12, BBMP',
            ward: 'Ward-12',
            district: 'Bangalore Urban',
            municipality: 'BBMP',
            urbanLocalBody: 'BBMP',
            imageUrl: 'https://example.com/streetlight.jpg',
            status: 'assigned',
            priority: 'Medium',
            reportedBy: bhupesh._id
        });

        await testReport1.save();
        await testReport2.save();
        console.log('✅ Created test reports for Ward-12');

        // Clear existing tasks for bhupesh to start fresh
        await Task.deleteMany({ assignedTo: bhupesh._id });

        // Create test tasks assigned to Bhupesh by District Admin
        const testTasks = [
            {
                title: 'Coordinate Pothole Repair on Main Street',
                description: 'Work with road department to fix the large pothole reported on Main Street. Ensure proper materials and timeline coordination.',
                priority: 'high',
                status: 'assigned',
                assignedTo: bhupesh._id,
                assignedBy: districtAdmin._id,
                department: 'Roads & Infrastructure',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                relatedReport: testReport1._id
            },
            {
                title: 'Streetlight Maintenance Coordination',
                description: 'Coordinate with electrical department to repair non-functioning streetlights in Gandhi Nagar area. Schedule maintenance crew and ensure safety measures.',
                priority: 'medium',
                status: 'assigned',
                assignedTo: bhupesh._id,
                assignedBy: districtAdmin._id,
                department: 'Electrical',
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                relatedReport: testReport2._id
            },
            {
                title: 'Monthly Ward-12 Infrastructure Assessment',
                description: 'Conduct comprehensive assessment of all infrastructure elements in Ward-12 including roads, streetlights, drainage, and public facilities. Submit detailed report.',
                priority: 'medium',
                status: 'assigned',
                assignedTo: bhupesh._id,
                assignedBy: districtAdmin._id,
                department: 'Municipal Administration',
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            },
            {
                title: 'Garbage Collection Route Optimization',
                description: 'Review and optimize garbage collection routes in Ward-12 to improve efficiency. Coordinate with waste management team and provide recommendations.',
                priority: 'low',
                status: 'assigned',
                assignedTo: bhupesh._id,
                assignedBy: districtAdmin._id,
                department: 'Waste Management',
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            },
            {
                title: 'Citizen Grievance Resolution Follow-up',
                description: 'Follow up on pending citizen grievances in Ward-12 and ensure timely resolution. Update status and provide feedback to district office.',
                priority: 'high',
                status: 'in_progress',
                assignedTo: bhupesh._id,
                assignedBy: districtAdmin._id,
                department: 'Citizen Services',
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                notes: [{
                    text: 'Started reviewing pending grievances. Found 12 pending cases.',
                    addedBy: bhupesh._id,
                    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
                }]
            }
        ];

        const createdTasks = await Task.insertMany(testTasks);
        console.log(`✅ Created ${createdTasks.length} tasks assigned to Bhupesh`);

        // Display summary
        console.log('\n📊 Test Data Summary:');
        console.log(`👤 Municipal Admin: ${bhupesh.name} (${bhupesh.email})`);
        console.log(`🏛️ Municipality: ${bhupesh.municipality}`);
        console.log(`📍 Assigned Ward: ${bhupesh.ward}`);
        console.log(`📋 Total Tasks Assigned: ${createdTasks.length}`);
        
        createdTasks.forEach((task, index) => {
            console.log(`   ${index + 1}. ${task.title} (${task.status} - ${task.priority} priority)`);
        });

        console.log('\n🔑 Login Credentials:');
        console.log('Email: bhupesh@gmail.com');
        console.log('Password: password123');

        console.log('\n✅ Test setup completed! Bhupesh can now log in and see his assigned tasks.');

        return {
            user: bhupesh,
            tasks: createdTasks,
            reports: [testReport1, testReport2]
        };

    } catch (error) {
        console.error('❌ Error creating test data:', error);
        throw error;
    }
};

// Run the test setup
createTestUserAndTasks()
    .then((result) => {
        console.log('\n🎉 Test User and Tasks Setup Completed Successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    });