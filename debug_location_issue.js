const axios = require('axios');

async function debugReportLocationIssue() {
    try {
        console.log('🔍 Debugging Report Location Issue...');

        // Step 1: Login
        console.log('\n1️⃣  Logging in as Yahya...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'yahya@gmail.com',
            password: '123456'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Step 2: Get municipal reports and check locations
        console.log('\n2️⃣  Getting municipal reports...');
        const reportsResponse = await axios.get('http://localhost:5000/api/municipal/reports', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const reports = reportsResponse.data.data || [];
        console.log(`📋 Found ${reports.length} reports for Chas Municipality`);

        if (reports.length > 0) {
            console.log('\n📍 Report Location Analysis:');
            reports.forEach((report, index) => {
                console.log(`\n${index + 1}. "${report.title}"`);
                console.log(`   📊 Status: ${report.status}`);
                console.log(`   🏷️ Category: ${report.category}`);
                console.log(`   🏛️ Urban Local Body: "${report.urbanLocalBody}"`);
                console.log(`   🏛️ District: "${report.district}"`);
                console.log(`   🏠 Ward: "${report.ward}"`);
                console.log(`   📍 Address: "${report.address}"`);
                console.log(`   📅 Created: ${new Date(report.createdAt).toLocaleString()}`);
                
                // Check if this is the problematic Chennai report
                if (report.address && report.address.includes('Chennai')) {
                    console.log(`   ⚠️  ISSUE: This report has Chennai address but is in Chas Municipality data!`);
                    console.log(`   🔧 Report ID: ${report._id}`);
                }
            });
        }

        // Step 3: Check all reports in database to find the Chennai one
        console.log('\n3️⃣  Checking all reports for Chennai entries...');
        const allReportsResponse = await axios.get('http://localhost:5000/api/reports', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const allReports = allReportsResponse.data.reports || [];
        const chennaiReports = allReports.filter(report => 
            report.address && report.address.includes('Chennai')
        );

        console.log(`\n🔍 Found ${chennaiReports.length} reports with Chennai addresses:`);
        chennaiReports.forEach((report, index) => {
            console.log(`\n${index + 1}. "${report.title}"`);
            console.log(`   🏛️ Urban Local Body: "${report.urbanLocalBody}"`);
            console.log(`   🏛️ District: "${report.district}"`);
            console.log(`   📍 Address: "${report.address}"`);
            console.log(`   🔧 Report ID: ${report._id}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

debugReportLocationIssue();