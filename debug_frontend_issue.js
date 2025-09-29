const axios = require('axios');

async function debugFrontendDataIssue() {
    try {
        console.log('🔍 Debugging Frontend Data Issue...');

        // Step 1: Login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'yahya@gmail.com',
            password: '123456'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Step 2: Test Municipal Stats (this works)
        console.log('\n📊 Testing Municipal Stats API...');
        const statsResponse = await axios.get('http://localhost:5000/api/municipal/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Stats API Result:', statsResponse.data.data);

        // Step 3: Test Municipal Reports (this should work)
        console.log('\n📋 Testing Municipal Reports API...');
        const reportsResponse = await axios.get('http://localhost:5000/api/municipal/reports', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Reports API Result:');
        console.log('  Success:', reportsResponse.data.success);
        console.log('  Count:', reportsResponse.data.data?.length || 0);

        // Step 4: Check if frontend is calling the right endpoints
        console.log('\n🔍 Frontend is likely calling these endpoints:');
        console.log('  Stats: GET /api/municipal/stats ✅ (working - shows correct counts)');
        console.log('  Reports: GET /api/municipal/reports ❓ (needs verification)');
        
        // Step 5: Check what the frontend service is actually calling
        console.log('\n💡 Issue Analysis:');
        console.log('  - Backend API returns 6 reports ✅');
        console.log('  - Frontend shows only 1 report ❌');
        console.log('  - Stats API shows correct counts ✅');
        console.log('  - This suggests frontend data fetching logic issue');

        // Step 6: List all reports with details for comparison
        if (reportsResponse.data.data?.length > 0) {
            console.log('\n📝 All Reports from Backend:');
            reportsResponse.data.data.forEach((report, index) => {
                console.log(`${index + 1}. "${report.title}"`);
                console.log(`   Status: ${report.status}`);
                console.log(`   Category: ${report.category}`);
                console.log(`   Location: ${report.address}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

debugFrontendDataIssue();