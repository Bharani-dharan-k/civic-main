require('./config/db');
const Report = require('./models/Report');

setTimeout(async () => {
  try {
    const reports = await Report.find().populate('reportedBy category assignedTo');
    console.log('\n📊 Database Reports Status:');
    console.log('Total reports in database:', reports.length);
    
    if (reports.length > 0) {
      console.log('\n📋 Report Details:');
      reports.forEach((r, i) => {
        console.log(`${i+1}. ${r.title}`);
        console.log(`   Status: ${r.status} | Priority: ${r.priority}`);
        console.log(`   Images: ${r.images?.length || 0} | Location: ${r.location?.address || 'N/A'}`);
        console.log('   ---');
      });
      
      // Show status breakdown
      const statusCount = {};
      const priorityCount = {};
      reports.forEach(r => {
        statusCount[r.status] = (statusCount[r.status] || 0) + 1;
        priorityCount[r.priority] = (priorityCount[r.priority] || 0) + 1;
      });
      
      console.log('\n📈 Status Breakdown:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} reports`);
      });
      
      console.log('\n⚡ Priority Breakdown:');
      Object.entries(priorityCount).forEach(([priority, count]) => {
        console.log(`   ${priority}: ${count} reports`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking reports:', error);
    process.exit(1);
  }
}, 2000);