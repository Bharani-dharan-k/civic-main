// Create Service Requests Sample Data
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Report = require('./models/Report');
const User = require('./models/User');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const createServiceRequests = async () => {
    try {
        await connectDB();

        // Find existing user or create sample user
        let sampleUser = await User.findOne({ email: 'citizen@example.com' });
        if (!sampleUser) {
            sampleUser = new User({
                name: 'Sample Citizen',
                email: 'citizen@example.com',
                phone: '9876543210',
                password: '$2b$10$sampleHashedPassword',
                userType: 'citizen',
                role: 'citizen',
                verified: true
            });
            await sampleUser.save();
            console.log('✅ Created sample citizen user');
        } else {
            console.log('👤 Using existing citizen user');
        }

        // Create service requests (maintenance, electrical, plumbing)
        console.log('🔧 Creating service requests...');
        const serviceRequests = [
            {
                title: 'Request for Community Hall Maintenance',
                description: 'Community hall needs painting and repair work before upcoming festival',
                category: 'maintenance',
                location: {
                    type: 'Point',
                    coordinates: [77.2060, 28.6109]
                },
                address: 'Community Hall, Sector 10, Ward 2',
                ward: 'Ward 2',
                imageUrl: 'https://example.com/maintenance.jpg',
                priority: 'Medium',
                status: 'submitted',
                reportedBy: sampleUser._id,
                estimatedResolutionTime: 72
            },
            {
                title: 'New Electrical Connection for Park',
                description: 'Request for electrical connection and lighting installation in new park area',
                category: 'electrical',
                location: {
                    type: 'Point',
                    coordinates: [77.2050, 28.6099]
                },
                address: 'New Park Area, Ward 3',
                ward: 'Ward 3',
                imageUrl: 'https://example.com/electrical.jpg',
                priority: 'Low',
                status: 'acknowledged',
                reportedBy: sampleUser._id,
                estimatedResolutionTime: 120
            },
            {
                title: 'Plumbing Work for Public Toilet',
                description: 'Public toilet requires new plumbing installation and water connection',
                category: 'plumbing',
                location: {
                    type: 'Point',
                    coordinates: [77.2040, 28.6089]
                },
                address: 'Bus Stand, Ward 1',
                ward: 'Ward 1',
                imageUrl: 'https://example.com/plumbing.jpg',
                priority: 'Medium',
                status: 'assigned',
                reportedBy: sampleUser._id,
                estimatedResolutionTime: 96
            },
            {
                title: 'School Building Maintenance Request',
                description: 'Primary school building requires roof repair and window replacement',
                category: 'maintenance',
                location: {
                    type: 'Point',
                    coordinates: [77.2030, 28.6079]
                },
                address: 'Government Primary School, Ward 2',
                ward: 'Ward 2',
                imageUrl: 'https://example.com/school-maintenance.jpg',
                priority: 'High',
                status: 'in_progress',
                reportedBy: sampleUser._id,
                estimatedResolutionTime: 168
            },
            {
                title: 'Electrical Wiring for Street Market',
                description: 'New street market area needs proper electrical wiring and connections',
                category: 'electrical',
                location: {
                    type: 'Point',
                    coordinates: [77.2020, 28.6069]
                },
                address: 'Street Market Area, Ward 1',
                ward: 'Ward 1',
                imageUrl: 'https://example.com/market-electrical.jpg',
                priority: 'Medium',
                status: 'submitted',
                reportedBy: sampleUser._id,
                estimatedResolutionTime: 144
            }
        ];

        // Insert service requests
        const insertedRequests = await Report.insertMany(serviceRequests);
        console.log(`✅ Created ${insertedRequests.length} service requests`);

        // Display summary
        console.log('\n🔍 Service Requests Summary:');
        for (const request of insertedRequests) {
            console.log(`- ${request.title} (${request.category}) - Status: ${request.status}`);
        }

        // Check total reports now
        const totalReports = await Report.countDocuments();
        console.log(`\n📊 Total reports in database: ${totalReports}`);

        // Count by categories
        const categories = ['maintenance', 'electrical', 'plumbing'];
        for (const category of categories) {
            const count = await Report.countDocuments({ category });
            console.log(`🏷️ ${category}: ${count} reports`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating service requests:', error);
        process.exit(1);
    }
};

createServiceRequests();
