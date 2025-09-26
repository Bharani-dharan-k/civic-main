// Debug script to check Chas Municipality reports and user authentication
const mongoose = require('mongoose');

// MongoDB connection
const mongoURI = 'mongodb+srv://bharanidharank23cse_db_user:bharani5544@cluster0.rctom2c.mongodb.net/civic-connect?retryWrites=true&w=majority&appName=Cluster0';

// User schema (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  municipality: String,
  ward: String,
  district: String
}, { timestamps: true });

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

const User = mongoose.model('User', userSchema);
const Report = mongoose.model('Report', reportSchema);

async function debugChasMunicipalityData() {
  try {
    console.log('🔍 Debugging Chas Municipality Data...\n');
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');
    
    // 1. Check if Yahya exists and his details
    console.log('1️⃣  Checking Yahya user data...');
    const yahya = await User.findOne({ email: 'yahya@gmail.com' });
    if (yahya) {
      console.log('✅ Yahya found in database:');
      console.log(`   Name: ${yahya.name}`);
      console.log(`   Email: ${yahya.email}`);
      console.log(`   Role: ${yahya.role}`);
      console.log(`   Municipality: ${yahya.municipality}`);
      console.log(`   Ward: ${yahya.ward}`);
      console.log(`   District: ${yahya.district}`);
      console.log(`   Password exists: ${!!yahya.password}`);
    } else {
      console.log('❌ Yahya not found in database');
    }
    
    // 2. Check all municipal admins for Chas Municipality
    console.log('\n2️⃣  Checking all municipal admins for Chas Municipality...');
    const chasAdmins = await User.find({ 
      municipality: 'Chas Municipality',
      role: { $in: ['municipality_admin', 'municipal_admin'] }
    });
    console.log(`✅ Found ${chasAdmins.length} municipal admin(s) for Chas Municipality:`);
    chasAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - ${admin.role}`);
    });
    
    // 3. Check reports for Chas Municipality
    console.log('\n3️⃣  Checking reports for Chas Municipality...');
    const chasReports = await Report.find({ municipality: 'Chas Municipality' });
    console.log(`✅ Found ${chasReports.length} report(s) for Chas Municipality:`);
    
    if (chasReports.length > 0) {
      chasReports.slice(0, 3).forEach((report, index) => {
        console.log(`   ${index + 1}. "${report.title}" - ${report.status} (${report.category})`);
        console.log(`      Municipality: ${report.municipality}`);
        console.log(`      Ward: ${report.ward}`);
        console.log(`      Assigned To: ${report.assignedTo || 'Unassigned'}`);
      });
      
      if (chasReports.length > 3) {
        console.log(`   ... and ${chasReports.length - 3} more reports`);
      }
    }
    
    // 4. Check reports by status for Chas Municipality
    console.log('\n4️⃣  Report status breakdown for Chas Municipality...');
    const statusCounts = await Report.aggregate([
      { $match: { municipality: 'Chas Municipality' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count} reports`);
    });
    
    // 5. Check if there are any reports with variations of municipality name
    console.log('\n5️⃣  Checking for municipality name variations...');
    const municipalityVariations = await Report.distinct('municipality');
    const chasVariations = municipalityVariations.filter(name => 
      name && name.toLowerCase().includes('chas')
    );
    console.log('Municipality name variations containing "chas":');
    chasVariations.forEach(variation => {
      console.log(`   "${variation}"`);
    });
    
    // 6. Test authentication for Yahya
    console.log('\n6️⃣  Testing authentication possibilities...');
    if (yahya) {
      console.log('Available authentication methods to test:');
      console.log(`   - Direct password comparison`);
      console.log(`   - Check if password is hashed`);
      console.log(`   - Role-based login endpoint`);
    }
    
    console.log('\n🎯 Summary:');
    console.log(`   Municipal Admins for Chas: ${chasAdmins.length}`);
    console.log(`   Reports for Chas: ${chasReports.length}`);
    console.log(`   Yahya exists: ${!!yahya}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Disconnected from MongoDB');
  }
}

// Run the debug
debugChasMunicipalityData();