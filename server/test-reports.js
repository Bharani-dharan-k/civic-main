const mongoose = require('mongoose');
const Report = require('./models/Report');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/civic-platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testReports() {
    try {
        console.log('🔍 Checking reports in database...');
        
        const allReports = await Report.find().populate('reportedBy', 'name email phone');
        console.log(`📊 Total reports in database: ${allReports.length}`);
        
        if (allReports.length > 0) {
            console.log('📝 Sample reports:');
            allReports.slice(0, 5).forEach((report, index) => {
                console.log(`${index + 1}. Title: "${report.title}", Category: "${report.category}", Status: "${report.status}"`);
            });
            
            // Check categories
            const categories = [...new Set(allReports.map(r => r.category))];
            console.log('🏷️ Categories found:', categories);
            
            // Check municipal categories  
            const municipalCategories = ['pothole', 'streetlight', 'garbage', 'drainage', 'maintenance', 'electrical', 'plumbing', 'cleaning'];
            const municipalReports = allReports.filter(report => 
                municipalCategories.includes(report.category?.toLowerCase())
            );
            console.log(`🏛️ Municipal reports: ${municipalReports.length}`);
            
        } else {
            console.log('❌ No reports found in database');
            
            // Check if we have any users
            const users = await User.find();
            console.log(`👥 Users in database: ${users.length}`);
            
            if (users.length === 0) {
                console.log('🔧 Creating sample user first...');
                const sampleUser = new User({
                    name: 'Sample Citizen',
                    email: 'citizen@example.com',
                    password: '$2b$10$samplehashedpassword',
                    role: 'citizen',
                    phone: '+91-9999999999',
                    address: 'Sample Address, Ward 1'
                });
                await sampleUser.save();
                console.log('✅ Sample user created');
            }
            
            const sampleUser = await User.findOne();
            
            // Create sample municipal reports
            console.log('🔧 Creating sample municipal reports...');
            const sampleReports = [
                {
                    title: 'Street Light Not Working on Main Road',
                    description: 'The street light pole number 45 on Main Road has been non-functional for the past week',
                    category: 'streetlight',
                    location: {
                        type: 'Point',
                        coordinates: [77.2090, 28.6139]
                    },
                    address: 'Main Road, Near Park, Ward 1',
                    ward: 'Ward 1',
                    imageUrl: 'https://example.com/streetlight.jpg',
                    priority: 'High',
                    status: 'submitted',
                    reportedBy: sampleUser._id,
                    estimatedResolutionTime: 24
                },
                {
                    title: 'Large Pothole on Gandhi Road',
                    description: 'Deep pothole causing traffic issues and vehicle damage',
                    category: 'pothole',
                    location: {
                        type: 'Point',
                        coordinates: [77.2100, 28.6149]
                    },
                    address: 'Gandhi Road, Ward 2',
                    ward: 'Ward 2',
                    imageUrl: 'https://example.com/pothole.jpg',
                    priority: 'Critical',
                    status: 'acknowledged',
                    reportedBy: sampleUser._id,
                    estimatedResolutionTime: 48
                },
                {
                    title: 'Garbage Not Collected for 3 Days',
                    description: 'Regular garbage collection has not happened in our sector',
                    category: 'garbage',
                    location: {
                        type: 'Point',
                        coordinates: [77.2080, 28.6129]
                    },
                    address: 'Sector 15, Ward 1',
                    ward: 'Ward 1',
                    imageUrl: 'https://example.com/garbage.jpg',
                    priority: 'Medium',
                    status: 'assigned',
                    reportedBy: sampleUser._id,
                    estimatedResolutionTime: 12
                },
                {
                    title: 'Water Clogging Due to Blocked Drainage',
                    description: 'Water is accumulating on road due to blocked storm drain',
                    category: 'drainage',
                    location: {
                        type: 'Point',
                        coordinates: [77.2070, 28.6119]
                    },
                    address: 'Liberty Street, Ward 3',
                    ward: 'Ward 3',
                    imageUrl: 'https://example.com/drainage.jpg',
                    priority: 'High',
                    status: 'in_progress',
                    reportedBy: sampleUser._id,
                    estimatedResolutionTime: 36
                },
                // Service Requests (maintenance, electrical, plumbing)
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
                }
            ];
            
            for (const reportData of sampleReports) {
                const report = new Report(reportData);
                await report.save();
                console.log(`✅ Created: ${report.title}`);
            }
            
            console.log('🎉 Sample municipal reports created successfully!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testReports();