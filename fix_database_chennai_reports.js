const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Define Report schema (simplified)
const reportSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    address: String,
    ward: String,
    district: String,
    urbanLocalBody: String,
    status: String,
    createdAt: Date,
    updatedAt: Date
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

async function fixChennaiReports() {
    try {
        await connectToDatabase();
        
        console.log('🔍 Finding reports with Chennai addresses...');
        
        // Find all reports with Chennai in address
        const chennaiReports = await Report.find({
            address: { $regex: /Chennai/i }
        });
        
        console.log(`📋 Found ${chennaiReports.length} reports with Chennai addresses`);
        
        for (const report of chennaiReports) {
            console.log(`\n🔧 Fixing report: "${report.title}"`);
            console.log(`   Current Urban Local Body: "${report.urbanLocalBody}"`);
            console.log(`   Current Address: "${report.address}"`);
            
            // Determine the correct municipality based on current urbanLocalBody
            let correctMunicipality = '';
            let correctAddress = '';
            let correctDistrict = '';
            
            switch (report.urbanLocalBody.toLowerCase()) {
                case 'chas':
                    correctMunicipality = 'Chas Municipality';
                    correctAddress = 'Main Road, Ward 1, Chas Municipality, Bokaro';
                    correctDistrict = 'Bokaro';
                    break;
                case 'phusro':
                    correctMunicipality = 'Phusro Municipality';  
                    correctAddress = 'Central Area, Phusro Municipality, Bokaro';
                    correctDistrict = 'Bokaro';
                    break;
                case 'ramgarh':
                    correctMunicipality = 'Ramgarh Municipality';
                    correctAddress = 'Town Center, Ramgarh Municipality, Ramgarh';
                    correctDistrict = 'Ramgarh';
                    break;
                case 'hussainabad':
                    correctMunicipality = 'Hussainabad Municipality';
                    correctAddress = 'Main Street, Hussainabad Municipality, Palamu';
                    correctDistrict = 'Palamu';
                    break;
                case 'kodarma':
                    correctMunicipality = 'Koderma Municipality';
                    correctAddress = 'City Center, Koderma Municipality, Koderma';
                    correctDistrict = 'Koderma';
                    break;
                case 'giridih':
                    correctMunicipality = 'Giridih Municipality';
                    correctAddress = 'Main Road, Giridih Municipality, Giridih';
                    correctDistrict = 'Giridih';
                    break;
                default:
                    console.log(`   ⚠️  Unknown municipality: ${report.urbanLocalBody}`);
                    continue;
            }
            
            // Update the report
            const result = await Report.updateOne(
                { _id: report._id },
                {
                    $set: {
                        urbanLocalBody: correctMunicipality,
                        address: correctAddress,
                        district: correctDistrict,
                        ward: '1' // Default to ward 1
                    }
                }
            );
            
            if (result.modifiedCount > 0) {
                console.log(`   ✅ Updated successfully`);
                console.log(`   New Urban Local Body: "${correctMunicipality}"`);
                console.log(`   New Address: "${correctAddress}"`);
            } else {
                console.log(`   ⚠️  No changes made`);
            }
        }
        
        console.log('\n🎉 All Chennai reports have been fixed!');
        
        // Verify the fix
        console.log('\n🔍 Verifying fixes...');
        const stillChennaiReports = await Report.find({
            address: { $regex: /Chennai/i }
        });
        
        if (stillChennaiReports.length === 0) {
            console.log('✅ All Chennai addresses have been corrected!');
        } else {
            console.log(`⚠️  Still found ${stillChennaiReports.length} reports with Chennai addresses`);
        }
        
    } catch (error) {
        console.error('❌ Error fixing reports:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📤 Database connection closed');
    }
}

// Run the fix
fixChennaiReports();