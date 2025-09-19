const mongoose = require('mongoose');
require('dotenv').config();
const Report = require('./models/Report');

const updateStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        // Update status to ensure service requests show up
        const updated = await Report.updateMany(
            { 
                category: { $in: ['maintenance', 'electrical', 'plumbing'] },
                status: 'in_progress'
            }, 
            { status: 'assigned' }
        );
        
        console.log(`✅ Updated ${updated.modifiedCount} reports status from 'in_progress' to 'assigned'`);
        
        // Show current service request counts
        const serviceReports = await Report.find({
            category: { $in: ['maintenance', 'electrical', 'plumbing'] }
        });
        
        console.log('\n📊 Current Service Request Status:');
        const statusCounts = {};
        serviceReports.forEach(report => {
            const status = report.status;
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`${status}: ${count}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateStatus();