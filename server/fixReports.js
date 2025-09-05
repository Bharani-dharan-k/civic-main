const mongoose = require('mongoose');
const Report = require('./models/Report');
require('dotenv').config();

async function fixReports() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app');
    console.log('Connected to MongoDB...');
    
    // Fix reports with invalid categories
    const result1 = await Report.updateMany(
      { category: 'Streetlight' },
      { category: 'streetlight' }
    );
    console.log('Fixed category case:', result1.modifiedCount, 'reports');
    
    // Fix reports with missing address
    const result2 = await Report.updateMany(
      { $or: [{ address: { $exists: false } }, { address: null }, { address: '' }] },
      { address: 'Address not specified' }
    );
    console.log('Added missing address:', result2.modifiedCount, 'reports');
    
    // Also fix any other case mismatches
    const fixes = [
      { from: 'Pothole', to: 'pothole' },
      { from: 'Garbage', to: 'garbage' },
      { from: 'Waste', to: 'garbage' },
      { from: 'Drainage', to: 'drainage' },
      { from: 'Other', to: 'other' }
    ];
    
    for (const fix of fixes) {
      const result = await Report.updateMany(
        { category: fix.from },
        { category: fix.to }
      );
      if (result.modifiedCount > 0) {
        console.log('Fixed', fix.from, 'to', fix.to, ':', result.modifiedCount, 'reports');
      }
    }
    
    // Check the problematic report specifically
    const problemReport = await Report.findById('68b7df90ec5be656d54d2592');
    if (problemReport) {
      console.log('Problem report before fix:');
      console.log('Category:', problemReport.category);
      console.log('Address:', problemReport.address);
      
      // Fix it directly
      problemReport.category = 'streetlight';
      if (!problemReport.address) {
        problemReport.address = 'Address not specified';
      }
      
      await problemReport.save({ validateBeforeSave: false });
      console.log('Fixed problem report directly');
    }
    
    console.log('All fixes completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixReports();
