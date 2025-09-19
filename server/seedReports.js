const mongoose = require('mongoose');
const Report = require('./models/Report');
const User = require('./models/User');
require('dotenv').config();

const seedReports = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB...');

        // Get some existing citizens to use as reporters
        const citizens = await User.find({ role: 'citizen' }).limit(5);
        if (citizens.length === 0) {
            console.log('No citizens found. Please run seedCitizens.js first.');
            return;
        }

        console.log(`Found ${citizens.length} citizens to use as reporters`);

        // Delete existing reports
        await Report.deleteMany({});
        console.log('Cleared existing reports');

        // Create dummy reports
        const dummyReports = [
            {
                title: 'Broken Street Light on Main Road',
                description: 'The street light near the bus stop on Main Road has been broken for over a week. This creates safety concerns for pedestrians walking at night.',
                category: 'streetlight',
                location: {
                    type: 'Point',
                    coordinates: [77.2090, 28.6139] // Delhi coordinates
                },
                address: 'Main Road, Near Bus Stop, Sector 15, Delhi',
                ward: 'Ward 12',
                imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
                status: 'submitted',
                priority: 'High',
                reportedBy: citizens[0]._id
            },
            {
                title: 'Pothole on Ring Road',
                description: 'Large pothole causing damage to vehicles. Multiple cars have had tire damage due to this deep pothole.',
                category: 'pothole',
                location: {
                    type: 'Point',
                    coordinates: [77.2167, 28.6278]
                },
                address: 'Ring Road, Near Metro Station, Delhi',
                ward: 'Ward 8',
                imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=400&h=300&fit=crop',
                status: 'acknowledged',
                priority: 'Critical',
                reportedBy: citizens[1]._id
            },
            {
                title: 'Garbage Not Collected for 3 Days',
                description: 'Garbage bins are overflowing in our residential area. The smell is becoming unbearable and attracting stray animals.',
                category: 'garbage',
                location: {
                    type: 'Point',
                    coordinates: [77.1907, 28.6304]
                },
                address: 'Residential Colony, Block C, Sector 22, Delhi',
                ward: 'Ward 5',
                imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=300&fit=crop',
                status: 'submitted',
                priority: 'Medium',
                reportedBy: citizens[2]._id
            },
            {
                title: 'Water Drainage Issue in Park',
                description: 'Water logging in the local park after recent rains. The drainage system seems to be blocked causing stagnant water.',
                category: 'drainage',
                location: {
                    type: 'Point',
                    coordinates: [77.2245, 28.6358]
                },
                address: 'Central Park, Sector 18, Delhi',
                ward: 'Ward 14',
                imageUrl: 'https://images.unsplash.com/photo-1517242027094-631c8d229e0d?w=400&h=300&fit=crop',
                status: 'submitted',
                priority: 'Medium',
                reportedBy: citizens[0]._id
            },
            {
                title: 'Damaged Playground Equipment',
                description: 'Swings in the children\'s playground are broken and pose safety risk. Sharp edges exposed that could hurt children.',
                category: 'maintenance',
                location: {
                    type: 'Point',
                    coordinates: [77.1975, 28.6185]
                },
                address: 'Community Playground, Sector 11, Delhi',
                ward: 'Ward 7',
                imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
                status: 'acknowledged',
                priority: 'High',
                reportedBy: citizens[1]._id
            },
            {
                title: 'Electrical Wire Hanging Dangerously',
                description: 'Loose electrical wire hanging low across the street. Very dangerous for tall vehicles and pedestrians.',
                category: 'electrical',
                location: {
                    type: 'Point',
                    coordinates: [77.2123, 28.6421]
                },
                address: 'Market Street, Near School, Sector 9, Delhi',
                ward: 'Ward 3',
                imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                status: 'submitted',
                priority: 'Critical',
                reportedBy: citizens[2]._id
            },
            {
                title: 'Public Toilet Needs Cleaning',
                description: 'The public toilet near the market is in very poor condition and needs immediate cleaning and maintenance.',
                category: 'cleaning',
                location: {
                    type: 'Point',
                    coordinates: [77.2056, 28.6067]
                },
                address: 'Market Area, Public Toilet, Sector 16, Delhi',
                ward: 'Ward 10',
                imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
                status: 'submitted',
                priority: 'Medium',
                reportedBy: citizens[3] || citizens[0]._id
            },
            {
                title: 'Water Pipe Leakage on Footpath',
                description: 'Major water pipe leak causing flooding on the footpath. Water is being wasted and creating slippery conditions.',
                category: 'plumbing',
                location: {
                    type: 'Point',
                    coordinates: [77.1889, 28.6456]
                },
                address: 'Commercial Complex, Footpath Area, Sector 20, Delhi',
                ward: 'Ward 2',
                imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
                status: 'acknowledged',
                priority: 'High',
                reportedBy: citizens[4] || citizens[1]._id
            },
            {
                title: 'Stray Dog Menace in Residential Area',
                description: 'Pack of aggressive stray dogs in our residential area. They are chasing children and creating safety concerns.',
                category: 'other',
                location: {
                    type: 'Point',
                    coordinates: [77.2312, 28.6178]
                },
                address: 'Residential Area, Block D, Sector 25, Delhi',
                ward: 'Ward 15',
                imageUrl: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop',
                status: 'submitted',
                priority: 'Medium',
                reportedBy: citizens[0]._id
            },
            {
                title: 'Road Construction Debris Not Cleared',
                description: 'Road construction was completed last week but debris and materials are still scattered on the road causing traffic issues.',
                category: 'maintenance',
                location: {
                    type: 'Point',
                    coordinates: [77.1834, 28.6234]
                },
                address: 'Highway Extension, Near Hospital, Sector 13, Delhi',
                ward: 'Ward 6',
                imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop',
                status: 'submitted',
                priority: 'Low',
                reportedBy: citizens[2]._id
            }
        ];

        // Insert the reports
        const insertedReports = await Report.insertMany(dummyReports);
        console.log(`✅ Successfully inserted ${insertedReports.length} dummy reports`);

        // Display summary
        const statusCounts = await Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        console.log('\n📊 Reports Summary:');
        statusCounts.forEach(status => {
            console.log(`  ${status._id}: ${status.count} reports`);
        });

        const priorityCounts = await Report.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        console.log('\n🎯 Priority Summary:');
        priorityCounts.forEach(priority => {
            console.log(`  ${priority._id}: ${priority.count} reports`);
        });

    } catch (error) {
        console.error('❌ Error seeding reports:', error);
    } finally {
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the seeding function
seedReports();