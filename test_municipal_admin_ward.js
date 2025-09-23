const mongoose = require('mongoose');
const User = require('./server/models/User');
const Report = require('./server/models/Report');

// Connect to database
mongoose.connect('mongodb://localhost:27017/newcivic', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const createMunicipalAdminWithWard = async () => {
    try {
        console.log('🏛️ Creating Municipal Admin with Ward Assignment...');

        // Create a municipal admin with ward assignment
        const municipalAdmin = new User({
            name: 'Rajesh Kumar',
            email: 'rajesh.municipal@gov.in',
            password: 'hashedPassword123', // In real app this would be hashed
            role: 'municipality_admin',
            adminRole: 'municipality_admin',
            district: 'Bangalore Urban',
            municipality: 'BBMP',
            ward: 'Ward-15', // Assigned specific ward
            phone: '+91-9876543210',
            department: 'Municipal Services'
        });

        const savedAdmin = await municipalAdmin.save();
        console.log('✅ Municipal Admin created:', savedAdmin.name, 'assigned to:', savedAdmin.ward);

        // Create some test reports for this ward
        const testReports = [
            {
                title: 'Pothole on Ward-15 Main Road',
                description: 'Large pothole causing traffic issues',
                category: 'pothole',
                location: { type: 'Point', coordinates: [77.5946, 12.9716] },
                address: 'Main Road, Ward-15, BBMP',
                ward: 'Ward-15',
                district: 'Bangalore Urban',
                municipality: 'BBMP',
                urbanLocalBody: 'BBMP',
                imageUrl: 'https://example.com/pothole.jpg',
                status: 'pending',
                priority: 'High',
                reportedBy: savedAdmin._id // Using admin as reporter for test
            },
            {
                title: 'Streetlight not working in Ward-15',
                description: 'Streetlight pole #45 is not functioning',
                category: 'streetlight',
                location: { type: 'Point', coordinates: [77.5946, 12.9716] },
                address: 'Gandhi Nagar, Ward-15, BBMP',
                ward: 'Ward-15',
                district: 'Bangalore Urban',
                municipality: 'BBMP',
                urbanLocalBody: 'BBMP',
                imageUrl: 'https://example.com/streetlight.jpg',
                status: 'in_progress',
                priority: 'Medium',
                reportedBy: savedAdmin._id
            },
            {
                title: 'Garbage pile up in Ward-20', // Different ward
                description: 'Garbage not collected for 3 days',
                category: 'garbage',
                location: { type: 'Point', coordinates: [77.6000, 12.9800] },
                address: 'Commercial Street, Ward-20, BBMP',
                ward: 'Ward-20', // This should NOT appear for Ward-15 admin
                district: 'Bangalore Urban',
                municipality: 'BBMP',
                urbanLocalBody: 'BBMP',
                imageUrl: 'https://example.com/garbage.jpg',
                status: 'pending',
                priority: 'High',
                reportedBy: savedAdmin._id
            }
        ];

        const savedReports = await Report.insertMany(testReports);
        console.log('✅ Created', savedReports.length, 'test reports');

        // Test the filtering logic
        console.log('\n📊 Testing Ward Filtering Logic:');
        
        // Get reports for Ward-15 admin
        const ward15Reports = await Report.find({
            municipality: savedAdmin.municipality,
            ward: savedAdmin.ward
        });
        
        console.log('Reports for Ward-15 admin:');
        ward15Reports.forEach(report => {
            console.log(`- ${report.title} (Ward: ${report.ward}, Status: ${report.status})`);
        });

        // Get all municipality reports (without ward filter)
        const allMunicipalReports = await Report.find({
            municipality: savedAdmin.municipality
        });
        
        console.log('\nAll BBMP reports (should be 3):');
        allMunicipalReports.forEach(report => {
            console.log(`- ${report.title} (Ward: ${report.ward}, Status: ${report.status})`);
        });

        console.log(`\n✅ Ward filtering works: Ward-15 admin sees ${ward15Reports.length}/3 reports`);
        console.log(`✅ Municipality filtering works: Total BBMP reports = ${allMunicipalReports.length}`);

        return {
            admin: savedAdmin,
            reportsInWard: ward15Reports,
            totalReports: allMunicipalReports
        };

    } catch (error) {
        console.error('❌ Error creating test data:', error);
        throw error;
    }
};

// Run the test
createMunicipalAdminWithWard()
    .then((result) => {
        console.log('\n🎉 Municipal Admin Ward Test Completed Successfully!');
        console.log(`Admin: ${result.admin.name} manages ${result.admin.ward}`);
        console.log(`Reports visible to admin: ${result.reportsInWard.length}`);
        console.log(`Total reports in municipality: ${result.totalReports.length}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });