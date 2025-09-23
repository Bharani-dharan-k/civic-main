require('dotenv').config();
const mongoose = require('mongoose');

console.log('📝 Creating simple sample reports...');

// Simple report schema without geospatial indexing
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'rejected'], default: 'pending' },
  address: String,
  latitude: Number,
  longitude: Number,
  district: String,
  municipality: String,
  ward: String,
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  images: [String],
  videos: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function createSampleReports() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to civic-connect database');
    
    const reportCount = await Report.countDocuments();
    console.log(`📊 Current reports: ${reportCount}`);
    
    if (reportCount < 10) {
      const citizenUser = await User.findOne({ email: 'citizen@gmail.com' });
      const adminUser = await User.findOne({ email: 'bhupesh@gmail.com' });
      
      const sampleReports = [
        {
          title: 'Pothole on Main Road',
          description: 'Large pothole causing traffic issues on Main Road near City Center',
          category: 'Road Infrastructure',
          priority: 'high',
          status: 'pending',
          address: 'Main Road, City Center, Bokaro, Jharkhand',
          latitude: 23.6693,
          longitude: 86.1511,
          district: 'Bokaro',
          municipality: 'Bokaro Municipality',
          ward: 'Ward 1',
          citizen: citizenUser?._id,
          assignedTo: adminUser?._id
        },
        {
          title: 'Street Light Not Working',
          description: 'Street light pole #45 has been non-functional for 3 days',
          category: 'Electrical',
          priority: 'medium',
          status: 'in_progress',
          address: 'Sector 4, Bokaro Steel City, Jharkhand',
          latitude: 23.6703,
          longitude: 86.1611,
          district: 'Bokaro',
          municipality: 'Bokaro Steel City',
          ward: 'Ward 2',
          citizen: citizenUser?._id
        },
        {
          title: 'Garbage Collection Issue',
          description: 'Garbage has not been collected from our area for the past week',
          category: 'Waste Management',
          priority: 'high',
          status: 'pending',
          address: 'Residential Area, Chas, Bokaro, Jharkhand',
          latitude: 23.6403,
          longitude: 86.1711,
          district: 'Bokaro',
          municipality: 'Bokaro Municipality',
          ward: 'Ward 3',
          citizen: citizenUser?._id
        },
        {
          title: 'Water Supply Disruption',
          description: 'No water supply in our locality for the past 2 days',
          category: 'Water Supply',
          priority: 'critical',
          status: 'pending',
          address: 'Sector 2, Bokaro Steel City, Jharkhand',
          latitude: 23.6593,
          longitude: 86.1411,
          district: 'Bokaro',
          municipality: 'Bokaro Steel City',
          ward: 'Ward 4',
          citizen: citizenUser?._id
        },
        {
          title: 'Park Maintenance Required',
          description: 'Children park needs cleaning and equipment repair',
          category: 'Parks & Recreation',
          priority: 'low',
          status: 'pending',
          address: 'City Park, Bokaro, Jharkhand',
          latitude: 23.6793,
          longitude: 86.1311,
          district: 'Bokaro',
          municipality: 'Bokaro Municipality',
          ward: 'Ward 5',
          citizen: citizenUser?._id
        },
        {
          title: 'Road Construction Noise',
          description: 'Excessive noise from construction work during night hours',
          category: 'Noise Pollution',
          priority: 'medium',
          status: 'in_progress',
          address: 'Industrial Area, Bokaro, Jharkhand',
          latitude: 23.6493,
          longitude: 86.1611,
          district: 'Bokaro',
          municipality: 'Bokaro Municipality',
          ward: 'Ward 6',
          citizen: citizenUser?._id,
          assignedTo: adminUser?._id
        },
        {
          title: 'Drainage System Blocked',
          description: 'Main drainage system is blocked causing water logging',
          category: 'Drainage',
          priority: 'high',
          status: 'resolved',
          address: 'Market Area, Bokaro, Jharkhand',
          latitude: 23.6893,
          longitude: 86.1211,
          district: 'Bokaro',
          municipality: 'Bokaro Municipality',
          ward: 'Ward 7',
          citizen: citizenUser?._id,
          assignedTo: adminUser?._id
        },
        {
          title: 'Traffic Signal Malfunction',
          description: 'Traffic signal at main intersection is not working properly',
          category: 'Traffic Management',
          priority: 'high',
          status: 'pending',
          address: 'Main Intersection, Bokaro, Jharkhand',
          latitude: 23.6393,
          longitude: 86.1811,
          district: 'Bokaro',
          municipality: 'Bokaro Municipality',
          ward: 'Ward 8',
          citizen: citizenUser?._id
        }
      ];
      
      console.log('\n📝 Creating sample reports...');
      let created = 0;
      
      for (const reportData of sampleReports) {
        try {
          const report = new Report(reportData);
          await report.save();
          console.log(`   ✅ Created: ${reportData.title}`);
          created++;
        } catch (error) {
          console.log(`   ❌ Error creating report: ${error.message}`);
        }
      }
      
      console.log(`\n✅ Successfully created ${created} sample reports`);
    }
    
    const finalCount = await Report.countDocuments();
    console.log(`\n🎯 Total reports in database: ${finalCount}`);
    
    // Show sample of reports
    const reports = await Report.find().limit(5).select('title status category priority');
    console.log('\n📋 Sample Reports:');
    reports.forEach((report, index) => {
      console.log(`   ${index + 1}. ${report.title} - ${report.status} (${report.priority})`);
    });
    
    console.log('\n🎉 Sample data creation complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

createSampleReports();