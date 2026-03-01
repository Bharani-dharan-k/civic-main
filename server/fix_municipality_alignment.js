const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Report = require('./models/Report');

const fixAlignment = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-portal');
        console.log('✅ Connected to MongoDB\n');

        console.log('🔧 FIXING MUNICIPALITY ALIGNMENT');
        console.log('='.repeat(60));

        // Fix 1: Standardize Bokaro-related reports to "Bokaro Municipality"
        console.log('\n1️⃣  Updating Bokaro-related reports...');
        
        const bokaro1 = await Report.updateMany(
            { urbanLocalBody: "phusro" },
            { $set: { urbanLocalBody: "Bokaro Municipality" } }
        );
        console.log(`   ✅ Updated ${bokaro1.modifiedCount} reports from "phusro" to "Bokaro Municipality"`);
        
        const bokaro2 = await Report.updateMany(
            { urbanLocalBody: "Phusro Municipality" },
            { $set: { urbanLocalBody: "Bokaro Municipality" } }
        );
        console.log(`   ✅ Updated ${bokaro2.modifiedCount} reports from "Phusro Municipality" to "Bokaro Municipality"`);
        
        const bokaro3 = await Report.updateMany(
            { urbanLocalBody: "chas" },
            { $set: { urbanLocalBody: "Chas Municipality" } }
        );
        console.log(`   ✅ Updated ${bokaro3.modifiedCount} reports from "chas" to "Chas Municipality"`);

        // Fix 2: Standardize Ranchi reports to "Ranchi"
        console.log('\n2️⃣  Updating Ranchi-related reports...');
        
        const ranchi1 = await Report.updateMany(
            { urbanLocalBody: "Ranchi Municipal Corporation" },
            { $set: { urbanLocalBody: "Ranchi" } }
        );
        console.log(`   ✅ Updated ${ranchi1.modifiedCount} reports from "Ranchi Municipal Corporation" to "Ranchi"`);
        
        const ranchi2 = await Report.updateMany(
            { urbanLocalBody: "ranchi" },
            { $set: { urbanLocalBody: "Ranchi" } }
        );
        console.log(`   ✅ Updated ${ranchi2.modifiedCount} reports from "ranchi" to "Ranchi"`);

        // Fix 3: Standardize other municipalities
        console.log('\n3️⃣  Standardizing other municipalities...');
        
        const jamshedpur = await Report.updateMany(
            { urbanLocalBody: "Jamshedpur Notified Area Committee" },
            { $set: { urbanLocalBody: "Jamshedpur" } }
        );
        console.log(`   ✅ Updated ${jamshedpur.modifiedCount} reports from "Jamshedpur Notified Area Committee" to "Jamshedpur"`);
        
        const dhanbad = await Report.updateMany(
            { urbanLocalBody: "Dhanbad Municipal Corporation" },
            { $set: { urbanLocalBody: "Dhanbad" } }
        );
        console.log(`   ✅ Updated ${dhanbad.modifiedCount} reports from "Dhanbad Municipal Corporation" to "Dhanbad"`);

        const chatra = await Report.updateMany(
            { urbanLocalBody: "chatra" },
            { $set: { urbanLocalBody: "Chatra" } }
        );
        console.log(`   ✅ Updated ${chatra.modifiedCount} reports from "chatra" to "Chatra"`);

        const giridih = await Report.updateMany(
            { urbanLocalBody: "giridih" },
            { $set: { urbanLocalBody: "Giridih Municipality" } }
        );
        console.log(`   ✅ Updated ${giridih.modifiedCount} reports from "giridih" to "Giridih Municipality"`);

        const latehar = await Report.updateMany(
            { urbanLocalBody: "latehar" },
            { $set: { urbanLocalBody: "Latehar" } }
        );
        console.log(`   ✅ Updated ${latehar.modifiedCount} reports from "latehar" to "Latehar"`);

        const chirkunda = await Report.updateMany(
            { urbanLocalBody: "chirkunda" },
            { $set: { urbanLocalBody: "Chirkunda" } }
        );
        console.log(`   ✅ Updated ${chirkunda.modifiedCount} reports from "chirkunda" to "Chirkunda"`);

        // Verify the fixes
        console.log('\n\n📊 VERIFICATION:');
        console.log('='.repeat(60));
        
        const admins = await User.find({ role: 'municipality_admin' });
        
        for (const admin of admins) {
            const count = await Report.countDocuments({ urbanLocalBody: admin.municipality });
            console.log(`\n👤 ${admin.name} (${admin.municipality})`);
            console.log(`   Reports: ${count} ${count === 0 ? '❌' : '✅'}`);
            
            if (count === 0 && admin.municipality === "Bokaro Municipality") {
                // Check for Phusro Municipality reports in Bokaro district
                const phusroCount = await Report.countDocuments({ 
                    district: "Bokaro",
                    urbanLocalBody: { $regex: /phusro/i }
                });
                if (phusroCount > 0) {
                    console.log(`   💡 Found ${phusroCount} Phusro reports in Bokaro district - needs manual assignment`);
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALIGNMENT COMPLETE\n');
        console.log('💡 Next Steps:');
        console.log('1. Refresh the Municipal Dashboard');
        console.log('2. Login as Bhupesh or Test Admin');
        console.log('3. Reports should now be visible in Dashboard Overview');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

fixAlignment();
