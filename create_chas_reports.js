// Check all reports and create test reports for Chas Municipality
const mongoose = require('mongoose');

// MongoDB connection
const mongoURI = 'mongodb+srv://bharanidharank23cse_db_user:bharani5544@cluster0.rctom2c.mongodb.net/civic-connect?retryWrites=true&w=majority&appName=Cluster0';

// Report schema (simplified) 
const reportSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  priority: String,
  status: String,
  municipality: String,
  ward: String,
  district: String,
  assignedTo: String,
  citizenId: String,
  location: {
    coordinates: [Number],
    address: String
  }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

async function createChasReports() {
  try {
    console.log('🏗️  Creating test reports for Chas Municipality...\n');
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');
    
    // 1. Check existing municipalities with reports
    console.log('1️⃣  Checking existing municipalities with reports...');
    const existingMunicipalities = await Report.distinct('municipality');
    console.log('Municipalities with existing reports:');
    existingMunicipalities.forEach(municipality => {
      console.log(`   "${municipality}"`);
    });
    
    // 2. Get a count of reports per municipality
    console.log('\n2️⃣  Report count by municipality...');
    const municipalityCounts = await Report.aggregate([
      { $group: { _id: '$municipality', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    municipalityCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count} reports`);
    });
    
    // 3. Create test reports for Chas Municipality
    console.log('\n3️⃣  Creating test reports for Chas Municipality...');
    
    const testReports = [
      {
        title: "Street Light Not Working",
        description: "Street light on Main Road Ward 1 has been out for 3 days",
        category: "Infrastructure",
        priority: "Medium",
        status: "pending",
        municipality: "Chas Municipality",
        ward: "1",
        district: "Bokaro",
        location: {
          coordinates: [85.3094, 23.6309],
          address: "Main Road, Ward 1, Chas Municipality"
        }
      },
      {
        title: "Water Supply Issue",
        description: "No water supply in residential area for the past 2 days",
        category: "Water Management",
        priority: "High",
        status: "in-progress",
        municipality: "Chas Municipality",
        ward: "1",
        district: "Bokaro",
        assignedTo: "Water Department",
        location: {
          coordinates: [85.3104, 23.6319],
          address: "Residential Area, Ward 1, Chas Municipality"
        }
      },
      {
        title: "Road Maintenance Required",
        description: "Potholes on the main connecting road need urgent repair",
        category: "Infrastructure",
        priority: "High",
        status: "pending",
        municipality: "Chas Municipality",
        ward: "1",
        district: "Bokaro",
        location: {
          coordinates: [85.3114, 23.6329],
          address: "Connecting Road, Ward 1, Chas Municipality"
        }
      },
      {
        title: "Waste Collection Delay",
        description: "Garbage has not been collected for 4 days in residential area",
        category: "Sanitation",
        priority: "Medium",
        status: "resolved",
        municipality: "Chas Municipality",
        ward: "1",
        district: "Bokaro",
        assignedTo: "Sanitation Department",
        location: {
          coordinates: [85.3124, 23.6339],
          address: "Residential Colony, Ward 1, Chas Municipality"
        }
      },
      {
        title: "Park Maintenance",
        description: "Community park needs cleaning and maintenance of play equipment",
        category: "Parks & Recreation",
        priority: "Low",
        status: "pending",
        municipality: "Chas Municipality",
        ward: "1",
        district: "Bokaro",
        location: {
          coordinates: [85.3134, 23.6349],
          address: "Community Park, Ward 1, Chas Municipality"
        }
      }
    ];
    
    // Insert the test reports
    const createdReports = await Report.insertMany(testReports);
    console.log(`✅ Successfully created ${createdReports.length} test reports for Chas Municipality`);
    
    // 4. Verify the reports were created
    console.log('\n4️⃣  Verifying created reports...');
    const chasReports = await Report.find({ municipality: 'Chas Municipality' });
    console.log(`✅ Total reports for Chas Municipality: ${chasReports.length}`);
    
    // Status breakdown
    const statusBreakdown = await Report.aggregate([
      { $match: { municipality: 'Chas Municipality' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Status breakdown for Chas Municipality:');
    statusBreakdown.forEach(status => {
      console.log(`   ${status._id}: ${status.count} reports`);
    });
    
    console.log('\n🎉 Test reports created successfully! Yahya should now see reports in the municipal dashboard.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Disconnected from MongoDB');
  }
}

// Run the script
createChasReports();