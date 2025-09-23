/**
 * Check what reports exist for Bhupesh's municipality and assign some for testing
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// Simple schema definitions
const UserSchema = new mongoose.Schema({}, { strict: false });
const ReportSchema = new mongoose.Schema({}, { strict: false });
const TaskSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', UserSchema);
const Report = mongoose.model('Report', ReportSchema);
const Task = mongoose.model('Task', TaskSchema);

async function checkAndAssignReports() {
    try {
        console.log('🔍 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Get Bhupesh
        const bhupesh = await User.findOne({ email: 'bhupesh@gmail.com' });
        console.log(`👤 Bhupesh: ${bhupesh.name} - Municipality: ${bhupesh.municipality}`);
        
        // Check reports for Bhupesh's municipality
        console.log('\n📄 Checking reports for Bokaro Municipality...');
        const bokaroReports = await Report.find({ 
            municipality: bhupesh.municipality 
        });
        console.log(`   Found ${bokaroReports.length} reports for Bokaro Municipality`);
        
        // Check all reports and their municipalities
        console.log('\n📊 All reports by municipality:');
        const allReports = await Report.find();
        const municipalityCount = {};
        allReports.forEach(report => {
            const muni = report.municipality || 'No Municipality';
            municipalityCount[muni] = (municipalityCount[muni] || 0) + 1;
        });
        Object.entries(municipalityCount).forEach(([muni, count]) => {
            console.log(`   ${muni}: ${count} reports`);
        });
        
        // Assign some reports to Bhupesh for testing
        console.log('\n🎯 Assigning reports to Bhupesh for testing...');
        const unassignedReports = await Report.find({ 
            $or: [
                { assignedTo: { $exists: false } },
                { assignedTo: null },
                { assignedTo: '' }
            ],
            municipality: bhupesh.municipality,
            status: { $in: ['submitted', 'acknowledged'] }
        }).limit(3);
        
        if (unassignedReports.length > 0) {
            console.log(`   Found ${unassignedReports.length} unassigned reports to assign`);
            
            for (let report of unassignedReports) {
                await Report.updateOne(
                    { _id: report._id },
                    { 
                        assignedTo: bhupesh._id.toString(),
                        status: 'assigned',
                        assignedAt: new Date(),
                        assignedBy: 'District Admin (Test Assignment)'
                    }
                );
                console.log(`   ✅ Assigned "${report.title}" to Bhupesh`);
            }
            
            console.log('\n🔍 Verifying assignments...');
            const nowAssigned = await Report.find({ assignedTo: bhupesh._id.toString() });
            console.log(`   ${nowAssigned.length} reports now assigned to Bhupesh`);
            
        } else {
            console.log('   No unassigned reports found for Bhupesh\'s municipality');
            
            // Try to find any reports we can assign for testing
            const anyUnassigned = await Report.find({ 
                $or: [
                    { assignedTo: { $exists: false } },
                    { assignedTo: null },
                    { assignedTo: '' }
                ],
                status: { $in: ['submitted', 'acknowledged'] }
            }).limit(2);
            
            if (anyUnassigned.length > 0) {
                console.log(`   Assigning ${anyUnassigned.length} reports from any municipality for testing...`);
                for (let report of anyUnassigned) {
                    await Report.updateOne(
                        { _id: report._id },
                        { 
                            assignedTo: bhupesh._id.toString(),
                            status: 'assigned',
                            assignedAt: new Date(),
                            assignedBy: 'District Admin (Test Assignment)',
                            municipality: bhupesh.municipality // Update municipality to match
                        }
                    );
                    console.log(`   ✅ Assigned and updated "${report.title}" to Bhupesh`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkAndAssignReports();