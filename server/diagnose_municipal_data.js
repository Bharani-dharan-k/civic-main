const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Report = require('./models/Report');

const diagnose = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-portal');
        console.log('✅ Connected to MongoDB\n');

        // 1. Find municipal admin user
        console.log('👤 CHECKING MUNICIPAL ADMIN USER:');
        console.log('='.repeat(60));
        
        const municipalAdmins = await User.find({ role: 'municipality_admin' }).select('name email municipality ward district');
        
        if (municipalAdmins.length === 0) {
            console.log('❌ NO MUNICIPAL ADMIN USERS FOUND!');
            console.log('   Create a municipal admin user first.\n');
        } else {
            console.log(`✅ Found ${municipalAdmins.length} municipal admin(s):\n`);
            municipalAdmins.forEach((admin, i) => {
                console.log(`${i + 1}. Name: ${admin.name}`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   Municipality: "${admin.municipality || 'NOT SET ❌'}"`);
                console.log(`   Ward: "${admin.ward || 'Not assigned'}"`);
                console.log(`   District: "${admin.district || 'NOT SET ❌'}"`);
                console.log('');
            });
        }

        // 2. Check reports
        console.log('\n📋 CHECKING REPORTS:');
        console.log('='.repeat(60));
        
        const allReports = await Report.find({}).select('title urbanLocalBody ward district status category');
        
        if (allReports.length === 0) {
            console.log('❌ NO REPORTS FOUND IN DATABASE!');
            console.log('   Create some test reports first.\n');
        } else {
            console.log(`✅ Found ${allReports.length} reports total:\n`);
            
            // Group by urbanLocalBody
            const reportsByMunicipality = {};
            allReports.forEach(report => {
                const municipality = report.urbanLocalBody || 'NO_MUNICIPALITY';
                if (!reportsByMunicipality[municipality]) {
                    reportsByMunicipality[municipality] = [];
                }
                reportsByMunicipality[municipality].push(report);
            });
            
            Object.keys(reportsByMunicipality).forEach(municipality => {
                const reports = reportsByMunicipality[municipality];
                console.log(`📍 Municipality: "${municipality}" - ${reports.length} report(s)`);
                reports.slice(0, 3).forEach((report, i) => {
                    console.log(`   ${i + 1}. ${report.title}`);
                    console.log(`      Ward: "${report.ward || 'Not set'}"`);
                    console.log(`      District: "${report.district || 'Not set'}"`);
                    console.log(`      Status: ${report.status}`);
                });
                if (reports.length > 3) {
                    console.log(`   ... and ${reports.length - 3} more`);
                }
                console.log('');
            });
        }

        // 3. Check for mismatch
        console.log('\n🔍 CHECKING FOR MISMATCHES:');
        console.log('='.repeat(60));
        
        if (municipalAdmins.length > 0 && allReports.length > 0) {
            municipalAdmins.forEach(admin => {
                const adminMunicipality = admin.municipality;
                const matchingReports = allReports.filter(r => r.urbanLocalBody === adminMunicipality);
                
                console.log(`\n👤 Admin: ${admin.name}`);
                console.log(`   Municipality: "${adminMunicipality}"`);
                console.log(`   Matching Reports: ${matchingReports.length}`);
                
                if (matchingReports.length === 0 && adminMunicipality) {
                    console.log('   ❌ WARNING: No reports match this municipality!');
                    console.log('   💡 FIX: Update reports to use urbanLocalBody = "' + adminMunicipality + '"');
                } else if (matchingReports.length > 0) {
                    console.log(`   ✅ ${matchingReports.length} reports will be visible to this admin`);
                }
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ DIAGNOSIS COMPLETE\n');

    } catch (error) {
        console.error('❌ Diagnosis error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

diagnose();
