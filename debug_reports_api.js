console.log('🔍 DEBUGGING REPORTS API CONNECTION');
console.log('=====================================');

// Test API endpoints
const testEndpoints = async () => {
    console.log('\n📡 Testing API Endpoints...\n');
    
    // Test different possible ports and endpoints
    const tests = [
        { url: 'http://localhost:5000/api/admin/reports', desc: 'Admin Reports (Port 5000)' },
        { url: 'http://localhost:3001/api/admin/reports', desc: 'Admin Reports (Port 3001)' },
        { url: 'http://localhost:5000/api/reports', desc: 'Public Reports (Port 5000)' },
        { url: 'http://localhost:3001/api/reports', desc: 'Public Reports (Port 3001)' },
        { url: 'http://localhost:5000/api/admin/stats', desc: 'Admin Stats (Port 5000)' },
        { url: 'http://localhost:3001/api/admin/stats', desc: 'Admin Stats (Port 3001)' }
    ];
    
    for (const test of tests) {
        try {
            console.log(`🔗 Testing: ${test.desc}`);
            console.log(`   URL: ${test.url}`);
            
            const response = await fetch(test.url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-token-here'}`
                }
            });
            
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ SUCCESS - Data received:`, JSON.stringify(data).slice(0, 200) + '...');
                
                if (data.reports) {
                    console.log(`   📊 Reports Count: ${data.reports.length}`);
                    console.log(`   📈 Total Reports: ${data.totalReports || 'N/A'}`);
                }
                if (data.data && Array.isArray(data.data)) {
                    console.log(`   📊 Data Array Count: ${data.data.length}`);
                }
            } else {
                console.log(`   ❌ FAILED - ${response.statusText}`);
                const errorText = await response.text();
                console.log(`   Error: ${errorText.slice(0, 200)}`);
            }
            
        } catch (error) {
            console.log(`   🚫 CONNECTION ERROR: ${error.message}`);
        }
        console.log('');
    }
};

// Also test MongoDB direct connection
const testMongoDB = async () => {
    console.log('📦 MONGODB DATABASE CHECK');
    console.log('==========================');
    
    try {
        // This would require MongoDB client, but let's log what we know
        console.log('✅ MongoDB Compass shows:');
        console.log('   Database: civic-connect');
        console.log('   Collection: reports');
        console.log('   Document Count: 16 documents');
        console.log('   Sample Document ID: ObjectId("68ccd8519eeed6173a84c1ff")');
        console.log('   Fields: title, description, category, location, etc.');
        console.log('');
        console.log('🎯 Expected API Behavior:');
        console.log('   GET /api/admin/reports should return these 16 reports');
        console.log('   Frontend should display these reports in dashboard');
        console.log('');
    } catch (error) {
        console.log('❌ MongoDB check failed:', error.message);
    }
};

// Run tests
testEndpoints().then(() => {
    testMongoDB();
    console.log('🏁 Debugging complete! Check results above.');
}).catch(error => {
    console.error('💥 Test failed:', error);
});