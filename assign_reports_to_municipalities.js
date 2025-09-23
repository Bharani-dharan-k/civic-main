const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic_system_v2');
const Report = require('./server/models/Report');

const assignReportsToMunicipalities = async () => {
    try {
        await mongoose.connection.once('open', async () => {
            console.log('🔄 Assigning reports to municipalities...');
            
            // Get some existing reports
            const reports = await Report.find({}).limit(10);
            console.log(`📋 Found ${reports.length} reports to assign`);
            
            // Assign them to different municipalities
            const municipalities = ['Bokaro Municipality', 'Test Municipality', 'Bermo Municipal Council'];
            
            for (let i = 0; i < reports.length; i++) {
                const report = reports[i];
                const municipality = municipalities[i % municipalities.length];
                
                await Report.findByIdAndUpdate(report._id, {
                    municipality: municipality,
                    district: 'Bokaro District' // Set district as well
                });
                
                console.log(`✅ Assigned report "${report.title}" to ${municipality}`);
            }
            
            console.log('🎉 Reports assigned successfully!');
            
            // Show summary
            for (const muni of municipalities) {
                const count = await Report.countDocuments({ municipality: muni });
                console.log(`🏛️ ${muni}: ${count} reports`);
            }
            
            process.exit(0);
        });
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

assignReportsToMunicipalities();