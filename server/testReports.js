const mongoose = require('mongoose');
const Report = require('./models/Report');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestReports() {
  try {
    console.log('🔍 Checking existing reports...');
    
    const existingReports = await Report.find();
    console.log(`Found ${existingReports.length} existing reports`);
    
    if (existingReports.length > 0) {
      console.log('✅ Reports already exist in database');
      existingReports.forEach(report => {
        console.log(`- ${report.title} (${report.status})`);
      });
      return;
    }

    console.log('📝 Creating test reports...');

    // Check if test user exists, create if not
    let testUser = await User.findOne({ email: 'testcitizen@example.com' });
    if (!testUser) {
      console.log('👤 Creating test citizen user...');
      testUser = new User({
        name: 'Test Citizen',
        email: 'testcitizen@example.com',
        password: '$2b$10$OApkdLa2.A6ic2omgLZA5uVx7edk8gJdteD2gADJK7ll7Opz5iNeS', // password: 123456
        role: 'citizen',
        phone: '+91-9999999999'
      });
      await testUser.save();
    }

    // Create test reports
    const testReports = [
      {
        title: 'Large Pothole on Main Street',
        description: 'There is a large pothole on Main Street near the market that is causing traffic issues and could damage vehicles.',
        category: 'pothole',
        location: {
          type: 'Point',
          coordinates: [85.3096, 23.3441] // [longitude, latitude]
        },
        address: 'Main Street, near Market, Ward 1',
        ward: 'Ward 1',
        imageUrl: 'https://example.com/pothole.jpg',
        reportedBy: testUser._id,
        priority: 'High',
        estimatedResolutionTime: 4
      },
      {
        title: 'Street Light Not Working',
        description: 'The street light on Park Road has not been working for the past 3 days. Area becomes very dark at night.',
        category: 'streetlight',
        location: {
          type: 'Point',
          coordinates: [85.3106, 23.3451]
        },
        address: 'Park Road, Block A, Ward 2',
        ward: 'Ward 2',
        imageUrl: 'https://example.com/streetlight.jpg',
        reportedBy: testUser._id,
        priority: 'Medium',
        estimatedResolutionTime: 2
      },
      {
        title: 'Garbage Collection Missed',
        description: 'Garbage collection has been missed for the past 3 days in our area. The bins are overflowing.',
        category: 'garbage',
        location: {
          type: 'Point',
          coordinates: [85.3116, 23.3461]
        },
        address: 'Green Park Extension, Ward 3',
        ward: 'Ward 3',
        imageUrl: 'https://example.com/garbage.jpg',
        reportedBy: testUser._id,
        priority: 'Medium',
        estimatedResolutionTime: 1,
        status: 'assigned',
        assignedTo: 'CLEAN003',
        assignedAt: new Date()
      },
      {
        title: 'Water Drainage Blocked',
        description: 'Storm water drainage is completely blocked causing water logging during rain.',
        category: 'drainage',
        location: {
          type: 'Point',
          coordinates: [85.3086, 23.3431]
        },
        address: 'Housing Colony, Phase 2, Ward 4',
        ward: 'Ward 4',
        imageUrl: 'https://example.com/drainage.jpg',
        reportedBy: testUser._id,
        priority: 'High',
        estimatedResolutionTime: 6,
        status: 'in_progress',
        assignedTo: 'FIELD001',
        assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        workerStartedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        title: 'Broken Electrical Line',
        description: 'Electrical line is hanging low and poses safety risk to pedestrians and vehicles.',
        category: 'electrical',
        location: {
          type: 'Point',
          coordinates: [85.3126, 23.3471]
        },
        address: 'Industrial Area, Gate 2, Ward 5',
        ward: 'Ward 5',
        imageUrl: 'https://example.com/electrical.jpg',
        reportedBy: testUser._id,
        priority: 'High',
        estimatedResolutionTime: 3
      },
      {
        title: 'Road Cleaning Required',
        description: 'Road needs cleaning as there is accumulated dust and debris affecting traffic.',
        category: 'cleaning',
        location: {
          type: 'Point',
          coordinates: [85.3076, 23.3421]
        },
        address: 'Commercial Street, Ward 1',
        ward: 'Ward 1',
        imageUrl: 'https://example.com/cleaning.jpg',
        reportedBy: testUser._id,
        priority: 'Low',
        estimatedResolutionTime: 2,
        status: 'resolved',
        assignedTo: 'CLEAN003',
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        workerStartedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        actualResolutionTime: 4
      }
    ];

    for (const reportData of testReports) {
      const report = new Report(reportData);
      await report.save();
      console.log(`✅ Created report: ${report.title}`);
    }

    console.log('🎉 Test reports created successfully!');
    console.log('\nTest URLs to try:');
    console.log('- Admin Dashboard: http://localhost:3000/admin/dashboard');
    console.log('- Reports Management: http://localhost:3000/admin/reports');
    console.log('- API Endpoint: http://localhost:5000/api/reports');

  } catch (error) {
    console.error('❌ Error creating test reports:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createTestReports();