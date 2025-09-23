console.log('🧪 TESTING UPDATED REPORTS FETCH');
console.log('================================');

// Test the new fetchReports logic
const testReportsFetch = async () => {
    try {
        console.log('📡 Fetching reports from public endpoint...');
        
        const response = await fetch('http://localhost:5000/api/reports');
        console.log(`Response Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            console.log('❌ Reports API not available');
            return [];
        }
        
        const data = await response.json();
        console.log('✅ Raw API Response:');
        console.log(`   Success: ${data.success}`);
        console.log(`   Count: ${data.count}`);
        console.log(`   Reports Array Length: ${data.reports?.length || 0}`);
        
        const reports = data.reports || data.data || [];
        console.log(`📊 Processed Reports Count: ${reports.length}`);
        
        if (reports.length > 0) {
            console.log(`📋 Sample Report:
   ID: ${reports[0]._id}
   Title: ${reports[0].title}
   Status: ${reports[0].status}
   Category: ${reports[0].category}
   Created: ${reports[0].createdAt}`);
        }
        
        return reports;
        
    } catch (error) {
        console.error('❌ Error fetching reports:', error);
        return [];
    }
};

// Test statistics calculation
const testStatsCalculation = async () => {
    console.log('\n📈 TESTING STATS CALCULATION');
    console.log('============================');
    
    try {
        const reports = await testReportsFetch();
        
        if (reports.length === 0) {
            console.log('⚠️ No reports found - stats will be zero');
            return;
        }
        
        // Calculate statistics like the dashboard does
        const totalReports = reports.length;
        const resolvedReports = reports.filter(r => 
            r.status === 'resolved' || r.status === 'completed'
        ).length;
        
        console.log(`\n📊 CALCULATED STATISTICS:
   Total Reports: ${totalReports}
   Resolved Reports: ${resolvedReports}
   Pending Reports: ${totalReports - resolvedReports}
   Resolution Rate: ${totalReports > 0 ? Math.round((resolvedReports/totalReports)*100) : 0}%`);
        
        // Show status breakdown
        const statusCounts = reports.reduce((acc, report) => {
            acc[report.status] = (acc[report.status] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\n📊 STATUS BREAKDOWN:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   ${status}: ${count}`);
        });
        
        // Show category breakdown
        const categoryCounts = reports.reduce((acc, report) => {
            acc[report.category] = (acc[report.category] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\n📊 CATEGORY BREAKDOWN:');
        Object.entries(categoryCounts).forEach(([category, count]) => {
            console.log(`   ${category}: ${count}`);
        });
        
    } catch (error) {
        console.error('❌ Error calculating stats:', error);
    }
};

// Run tests
console.log('🚀 Starting tests...\n');
testStatsCalculation().then(() => {
    console.log('\n✅ Tests completed!');
    console.log('\n🎯 Expected Dashboard Behavior:');
    console.log('   - Reports section should show actual reports from database');
    console.log('   - Statistics should show real counts (not zeros)');
    console.log('   - Total Reports should match MongoDB count of 16');
}).catch(error => {
    console.error('💥 Test failed:', error);
});