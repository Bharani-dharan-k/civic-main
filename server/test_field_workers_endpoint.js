const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const testFieldWorkersEndpoint = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🧪 TESTING FIELD WORKERS QUERY');
        console.log('='.repeat(70));

        // 1. Find Dharun (department head)
        const dharun = await User.findOne({ email: 'dharun@gmail.com' });
        if (!dharun) {
            console.log('❌ Dharun not found!');
            return;
        }

        console.log(`\n✅ Department Head: ${dharun.name}`);
        console.log(`   Department: ${dharun.department}`);
        console.log(`   Municipality: ${dharun.municipality}`);

        // 2. Find field workers in same department and municipality (simulating the endpoint)
        const fieldWorkers = await User.find({
            role: 'field_staff',
            department: dharun.department,
            municipality: dharun.municipality
        }).select('name email ward department municipality');

        console.log(`\n📋 FIELD WORKERS in ${dharun.department}, ${dharun.municipality}:`);
        console.log('-'.repeat(70));
        
        if (fieldWorkers.length === 0) {
            console.log('⚠️  No field workers found!');
            console.log('\n💡 Creating a test field worker...');
            
            // Create a test field worker
            const testWorker = new User({
                name: 'Test Field Worker',
                email: 'fieldworker@test.com',
                password: 'password123',
                role: 'field_staff',
                department: dharun.department,
                municipality: dharun.municipality,
                ward: 'Ward 5'
            });
            
            await testWorker.save();
            console.log('✅ Created field worker:', testWorker.name);
            
            const updatedWorkers = await User.find({
                role: 'field_staff',
                department: dharun.department,
                municipality: dharun.municipality
            }).select('name email ward department municipality');
            
            console.log('\n📋 Updated Field Workers:');
            updatedWorkers.forEach((worker, index) => {
                console.log(`${index + 1}. ${worker.name} (${worker.email})`);
                console.log(`   Ward: ${worker.ward || 'All wards'}`);
                console.log(`   Department: ${worker.department}`);
            });
        } else {
            fieldWorkers.forEach((worker, index) => {
                console.log(`${index + 1}. ${worker.name} (${worker.email})`);
                console.log(`   Ward: ${worker.ward || 'All wards'}`);
                console.log(`   Department: ${worker.department}`);
                console.log();
            });
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST COMPLETE');
        console.log('\n📌 API Endpoint: GET /api/department-head/field-workers');
        console.log('   Returns field workers in same department & municipality');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

testFieldWorkersEndpoint();
