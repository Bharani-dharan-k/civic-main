require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('🚀 Setting up Civic Connect Database on Atlas...');

// Define User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'municipality_admin', 'district_admin', 'super_admin', 'department_admin', 'staff'],
    default: 'citizen'
  },
  district: { type: String },
  municipality: { type: String },
  ward: { type: String },
  department: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

// Define Report schema
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'rejected'], default: 'pending' },
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    district: String,
    municipality: String,
    ward: String
  },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  images: [String],
  videos: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

async function setupDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to civic-connect database on Atlas');
    
    // Check existing data
    const userCount = await User.countDocuments();
    const reportCount = await Report.countDocuments();
    
    console.log(`\n📊 Current Data Status:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Reports: ${reportCount}`);
    
    // Create admin users if needed
    const adminUsers = [
      {
        name: 'Super Admin',
        email: 'bharani@gmail.com',
        password: '123456',
        role: 'super_admin',
        phone: '9876543210',
        district: 'Delhi',
        municipality: 'New Delhi Municipal Corporation'
      },
      {
        name: 'Dilshan District Admin',
        email: 'dilshan@gmail.com',
        password: '123456',
        role: 'district_admin',
        phone: '9876543211',
        district: 'Bokaro',
        municipality: 'Bokaro Steel City'
      },
      {
        name: 'Bhupesh Municipal Admin',
        email: 'bhupesh@gmail.com',
        password: '123456',
        role: 'municipality_admin',
        phone: '9876543212',
        district: 'Bokaro',
        municipality: 'Bokaro Municipality',
        ward: 'Ward 1'
      },
      {
        name: 'Dharun Department Admin',
        email: 'dharun@gmail.com',
        password: '123456',
        role: 'department_admin',
        phone: '9876543213',
        district: 'Bokaro',
        municipality: 'Bokaro Municipality',
        department: 'Public Works'
      },
      {
        name: 'Test Citizen',
        email: 'citizen@gmail.com',
        password: '123456',
        role: 'citizen',
        phone: '9876543214',
        district: 'Bokaro',
        municipality: 'Bokaro Municipality'
      }
    ];
    
    console.log('\n👥 Setting up admin users...');
    
    for (const userData of adminUsers) {
      try {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
          const user = new User(userData);
          await user.save();
          console.log(`   ✅ Created ${userData.role}: ${userData.email}`);
        } else {
          console.log(`   ⚠️  User already exists: ${userData.email}`);
        }
      } catch (error) {
        console.log(`   ❌ Error creating ${userData.email}:`, error.message);
      }
    }
    
    // Create sample reports if needed
    if (reportCount < 5) {
      console.log('\n📝 Creating sample reports...');
      
      const citizenUser = await User.findOne({ email: 'citizen@gmail.com' });
      const adminUser = await User.findOne({ email: 'bhupesh@gmail.com' });
      
      const sampleReports = [
        {
          title: 'Pothole on Main Road',
          description: 'Large pothole causing traffic issues on Main Road near City Center',
          category: 'Road Infrastructure',
          priority: 'high',
          status: 'pending',
          location: {
            address: 'Main Road, City Center, Bokaro, Jharkhand',
            coordinates: { latitude: 23.6693, longitude: 86.1511 },
            district: 'Bokaro',
            municipality: 'Bokaro Municipality',
            ward: 'Ward 1'
          },
          citizen: citizenUser?._id,
          assignedTo: adminUser?._id
        },
        {
          title: 'Street Light Not Working',
          description: 'Street light pole #45 has been non-functional for 3 days',
          category: 'Electrical',
          priority: 'medium',
          status: 'in_progress',
          location: {
            address: 'Sector 4, Bokaro Steel City, Jharkhand',
            coordinates: { latitude: 23.6703, longitude: 86.1611 },
            district: 'Bokaro',
            municipality: 'Bokaro Steel City',
            ward: 'Ward 2'
          },
          citizen: citizenUser?._id
        },
        {
          title: 'Garbage Collection Issue',
          description: 'Garbage has not been collected from our area for the past week',
          category: 'Waste Management',
          priority: 'high',
          status: 'pending',
          location: {
            address: 'Residential Area, Chas, Bokaro, Jharkhand',
            coordinates: { latitude: 23.6403, longitude: 86.1711 },
            district: 'Bokaro',
            municipality: 'Bokaro Municipality',
            ward: 'Ward 3'
          },
          citizen: citizenUser?._id
        }
      ];
      
      for (const reportData of sampleReports) {
        try {
          const report = new Report(reportData);
          await report.save();
          console.log(`   ✅ Created report: ${reportData.title}`);
        } catch (error) {
          console.log(`   ❌ Error creating report:`, error.message);
        }
      }
    }
    
    // Display final status
    const finalUserCount = await User.countDocuments();
    const finalReportCount = await Report.countDocuments();
    
    console.log(`\n🎯 Final Database Status:`);
    console.log(`   Users: ${finalUserCount}`);
    console.log(`   Reports: ${finalReportCount}`);
    console.log(`   Database: civic-connect`);
    console.log(`   Atlas Cluster: cluster0.rctom2c.mongodb.net`);
    
    console.log(`\n🔑 Login Credentials:`);
    console.log(`   Super Admin: bharani@gmail.com / 123456`);
    console.log(`   District Admin: dilshan@gmail.com / 123456`);
    console.log(`   Municipal Admin: bhupesh@gmail.com / 123456`);
    console.log(`   Department Admin: dharun@gmail.com / 123456`);
    console.log(`   Test Citizen: citizen@gmail.com / 123456`);
    
    console.log('\n🎉 Atlas Database setup complete!');
    console.log('🚀 Your project is now using the Atlas database exclusively');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

setupDatabase();