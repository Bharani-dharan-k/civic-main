const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Report = require('./models/Report');
const User = require('./models/User');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const categories = ['pothole', 'streetlight', 'garbage', 'drainage', 'maintenance', 'electrical', 'plumbing', 'cleaning'];
const statuses = ['submitted', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'rejected'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const districts = ['Ranchi', 'Dhanbad', 'Jamshedpur', 'Bokaro', 'Hazaribagh', 'Giridih', 'Deoghar'];
const municipalities = ['Ranchi Municipal Corporation', 'Dhanbad Municipal Corporation', 'Jamshedpur Notified Area Committee'];

// Sample locations in Jharkhand
const locations = [
    { address: 'Main Road, Ranchi', coordinates: [85.3096, 23.3441] },
    { address: 'Station Road, Dhanbad', coordinates: [86.4348, 23.7957] },
    { address: 'Bistupur, Jamshedpur', coordinates: [86.1844, 22.8046] },
    { address: 'City Centre, Bokaro', coordinates: [85.9647, 23.6693] },
    { address: 'Gandhi Chowk, Hazaribagh', coordinates: [85.3647, 23.9929] },
    { address: 'Jharia Road, Dhanbad', coordinates: [86.4304, 23.7644] },
    { address: 'Sakchi, Jamshedpur', coordinates: [86.1875, 22.7925] }
];

const generateRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedAnalyticsData = async () => {
    try {
        console.log('🌱 Starting to seed analytics data...');

        // Clear existing reports
        await Report.deleteMany({});
        console.log('✅ Cleared existing reports');

        // Create a test citizen user if doesn't exist
        let citizenUser = await User.findOne({ email: 'citizen@test.com' });
        if (!citizenUser) {
            citizenUser = new User({
                name: 'Test Citizen',
                email: 'citizen@test.com',
                password: 'password123',
                role: 'citizen',
                phone: '9876543210'
            });
            await citizenUser.save();
            console.log('✅ Created test citizen user');
        }

        // Generate reports for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const now = new Date();

        const reports = [];

        // Generate 200 sample reports
        for (let i = 0; i < 200; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            const district = districts[Math.floor(Math.random() * districts.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];

            const createdAt = generateRandomDate(sixMonthsAgo, now);

            // Generate resolved date for resolved reports
            let resolvedAt = null;
            if (status === 'resolved') {
                const minResolveTime = new Date(createdAt.getTime() + (1 * 24 * 60 * 60 * 1000)); // 1 day
                const maxResolveTime = new Date(createdAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
                const endDate = new Date(Math.min(maxResolveTime.getTime(), now.getTime()));
                resolvedAt = generateRandomDate(minResolveTime, endDate);
            }

            const report = {
                title: `${category.charAt(0).toUpperCase() + category.slice(1)} issue in ${district}`,
                description: `A ${category} problem reported in ${location.address}. This needs immediate attention from the concerned department.`,
                category,
                location: {
                    type: 'Point',
                    coordinates: location.coordinates
                },
                address: location.address,
                ward: `Ward ${Math.floor(Math.random() * 20) + 1}`,
                district,
                urbanLocalBody: municipalities[Math.floor(Math.random() * municipalities.length)],
                imageUrl: `https://example.com/images/report_${i + 1}.jpg`,
                status,
                priority,
                reportedBy: citizenUser._id,
                createdAt,
                ...(resolvedAt && { resolvedAt })
            };

            reports.push(report);
        }

        // Insert all reports
        await Report.insertMany(reports);
        console.log(`✅ Created ${reports.length} sample reports`);

        // Print analytics summary
        const totalReports = await Report.countDocuments();
        const resolvedReports = await Report.countDocuments({ status: 'resolved' });
        const pendingReports = await Report.countDocuments({
            status: { $in: ['submitted', 'acknowledged', 'assigned', 'in_progress'] }
        });

        console.log('\n📊 Analytics Data Summary:');
        console.log(`Total Reports: ${totalReports}`);
        console.log(`Resolved Reports: ${resolvedReports}`);
        console.log(`Pending Reports: ${pendingReports}`);
        console.log(`Resolution Rate: ${((resolvedReports / totalReports) * 100).toFixed(1)}%`);

        // Show distribution by status
        const statusDistribution = await Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('\n📈 Status Distribution:');
        statusDistribution.forEach(item => {
            console.log(`  ${item._id}: ${item.count}`);
        });

        // Show distribution by category
        const categoryDistribution = await Report.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('\n📋 Category Distribution:');
        categoryDistribution.forEach(item => {
            console.log(`  ${item._id}: ${item.count}`);
        });

        console.log('\n🎉 Analytics data seeding completed successfully!');
        console.log('🔗 You can now test the analytics at: http://localhost:3001/super-admin');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding analytics data:', error);
        process.exit(1);
    }
};

// Run the seeding
seedAnalyticsData();