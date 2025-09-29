// Check existing reports structure and create proper reports for Chas Municipality
const mongoose = require('mongoose');

// MongoDB connection
const mongoURI = 'mongodb+srv://bharanidharank23cse_db_user:bharani5544@cluster0.rctom2c.mongodb.net/civic-connect?retryWrites=true&w=majority&appName=Cluster0';

// Get user ID for Yahya (for reportedBy field)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  municipality: String,
  ward: String,
  district: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Proper Report schema based on the server model
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['pothole', 'streetlight', 'garbage', 'drainage', 'maintenance', 'electrical', 'plumbing', 'cleaning', 'other'],
    required: true
  },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: { type: String, required: true },
  ward: { type: String },
  district: { type: String },
  urbanLocalBody: { type: String }, // This might be the municipality field
  imageUrl: { type: String, required: true },
  videoUrl: { type: String },
  status: {
    type: String,
    enum: ['submitted', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'],
    default: 'submitted'
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: String },
  assignedDepartment: { type: String },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

async function createProperChasReports() {
  try {
    console.log('🏗️  Creating proper reports for Chas Municipality...\n');
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');
    
    // 1. Get Yahya's user ID for reportedBy field
    console.log('1️⃣  Getting Yahya user ID...');
    const yahya = await User.findOne({ email: 'yahya@gmail.com' });
    if (!yahya) {
      console.log('❌ Yahya user not found!');
      return;
    }
    console.log(`✅ Found Yahya: ${yahya._id}`);
    
    // 2. Check existing reports structure
    console.log('\n2️⃣  Checking existing reports structure...');
    const sampleReport = await Report.findOne({});
    if (sampleReport) {
      console.log('Sample report structure:');
      console.log('   ward:', sampleReport.ward);
      console.log('   district:', sampleReport.district);
      console.log('   urbanLocalBody:', sampleReport.urbanLocalBody);
      console.log('   category:', sampleReport.category);
      console.log('   status:', sampleReport.status);
    } else {
      console.log('No existing reports found');
    }
    
    // 3. Create test reports for Chas Municipality with proper structure
    console.log('\n3️⃣  Creating test reports for Chas Municipality...');
    
    const testReports = [
      {
        title: "Street Light Not Working in Ward 1",
        description: "Street light on Main Road Ward 1 has been out for 3 days, causing safety concerns for residents",
        category: "streetlight",
        location: {
          type: "Point",
          coordinates: [85.3094, 23.6309] // [longitude, latitude] for Chas area
        },
        address: "Main Road, Ward 1, Chas Municipality, Bokaro",
        ward: "1",
        district: "Bokaro",
        urbanLocalBody: "Chas Municipality",
        imageUrl: "https://example.com/streetlight-issue.jpg", // placeholder
        status: "submitted",
        priority: "Medium",
        reportedBy: yahya._id
      },
      {
        title: "Pothole on Connecting Road",
        description: "Large pothole on the main connecting road needs urgent repair as it's causing vehicle damage",
        category: "pothole",
        location: {
          type: "Point",
          coordinates: [85.3114, 23.6329]
        },
        address: "Connecting Road, Ward 1, Chas Municipality, Bokaro",
        ward: "1",
        district: "Bokaro",
        urbanLocalBody: "Chas Municipality",
        imageUrl: "https://example.com/pothole-issue.jpg",
        status: "acknowledged",
        priority: "High",
        reportedBy: yahya._id,
        assignedDepartment: "Public Works Department"
      },
      {
        title: "Garbage Collection Delay",
        description: "Garbage has not been collected for 4 days in residential area, creating health hazards",
        category: "garbage",
        location: {
          type: "Point",
          coordinates: [85.3124, 23.6339]
        },
        address: "Residential Colony, Ward 1, Chas Municipality, Bokaro",
        ward: "1",
        district: "Bokaro",
        urbanLocalBody: "Chas Municipality",
        imageUrl: "https://example.com/garbage-issue.jpg",
        status: "assigned",
        priority: "Medium",
        reportedBy: yahya._id,
        assignedTo: "SANITATION001",
        assignedDepartment: "Sanitation Department"
      },
      {
        title: "Drainage System Blocked",
        description: "Main drainage system is blocked causing water logging during rains",
        category: "drainage",
        location: {
          type: "Point",
          coordinates: [85.3134, 23.6349]
        },
        address: "Market Area, Ward 1, Chas Municipality, Bokaro",
        ward: "1",
        district: "Bokaro",
        urbanLocalBody: "Chas Municipality",
        imageUrl: "https://example.com/drainage-issue.jpg",
        status: "in_progress",
        priority: "High",
        reportedBy: yahya._id,
        assignedTo: "DRAINAGE001",
        assignedDepartment: "Water Management Department"
      },
      {
        title: "Public Park Maintenance Required",
        description: "Community park needs cleaning and maintenance of play equipment for children safety",
        category: "maintenance",
        location: {
          type: "Point",
          coordinates: [85.3144, 23.6359]
        },
        address: "Community Park, Ward 1, Chas Municipality, Bokaro",
        ward: "1",
        district: "Bokaro",
        urbanLocalBody: "Chas Municipality",
        imageUrl: "https://example.com/park-maintenance.jpg",
        status: "resolved",
        priority: "Low",
        reportedBy: yahya._id,
        assignedTo: "MAINTENANCE001",
        assignedDepartment: "Parks & Recreation Department"
      }
    ];
    
    // Insert the test reports
    const createdReports = await Report.insertMany(testReports);
    console.log(`✅ Successfully created ${createdReports.length} test reports for Chas Municipality`);
    
    // 4. Verify the reports were created
    console.log('\n4️⃣  Verifying created reports...');
    const chasReports = await Report.find({ urbanLocalBody: 'Chas Municipality' });
    console.log(`✅ Total reports for Chas Municipality: ${chasReports.length}`);
    
    // Status breakdown
    const statusBreakdown = await Report.aggregate([
      { $match: { urbanLocalBody: 'Chas Municipality' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Status breakdown for Chas Municipality:');
    statusBreakdown.forEach(status => {
      console.log(`   ${status._id}: ${status.count} reports`);
    });
    
    // Category breakdown
    const categoryBreakdown = await Report.aggregate([
      { $match: { urbanLocalBody: 'Chas Municipality' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 Category breakdown for Chas Municipality:');
    categoryBreakdown.forEach(category => {
      console.log(`   ${category._id}: ${category.count} reports`);
    });
    
    console.log('\n🎉 Test reports created successfully!');
    console.log('   ✅ Yahya should now see reports in the municipal dashboard');
    console.log('   ✅ Reports are properly structured with GeoJSON location');
    console.log('   ✅ Different statuses and categories for testing');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Disconnected from MongoDB');
  }
}

// Run the script
createProperChasReports();