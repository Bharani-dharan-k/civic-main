// Create Staff Data for Municipal Dashboard
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const createStaffData = async () => {
    try {
        await connectDB();

        console.log('👥 Creating staff data...');

        // Get or create a super admin to use as createdBy
        let superAdmin = await User.findOne({ role: 'super_admin' });
        if (!superAdmin) {
            // Create a super admin first
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            superAdmin = new User({
                name: 'System Admin',
                email: 'admin@system.gov.in',
                password: hashedPassword,
                role: 'super_admin',
                adminRole: 'super_admin',
                district: 'Central District',
                municipality: 'Central Municipal Corporation',
                department: 'Administration',
                verified: true
            });
            await superAdmin.save();
            console.log('✅ Created super admin for staff creation');
        }

        // Hash password for staff members
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('staff123', salt);

        const staffMembers = [
            {
                name: 'Rajesh Kumar',
                email: 'rajesh.kumar@municipal.gov.in',
                phone: '9876543210',
                password: hashedPassword,
                role: 'department_head',
                adminRole: 'department_head',
                userType: 'admin',
                department: 'Infrastructure',
                district: 'Central District',
                municipality: 'Central Municipal Corporation',
                ward: 'Ward 1',
                verified: true,
                isActive: true,
                attendance: 95,
                tasks_completed: 45,
                createdBy: superAdmin._id
            },
            {
                name: 'Priya Sharma',
                email: 'priya.sharma@municipal.gov.in',
                phone: '9876543211',
                password: hashedPassword,
                role: 'field_head',
                adminRole: 'field_head',
                userType: 'admin',
                department: 'Water Supply',
                district: 'Central District',
                municipality: 'Central Municipal Corporation',
                ward: 'Ward 2',
                verified: true,
                isActive: true,
                attendance: 92,
                tasks_completed: 38,
                createdBy: superAdmin._id
            },
            {
                name: 'Amit Singh',
                email: 'amit.singh@municipal.gov.in',
                phone: '9876543212',
                password: hashedPassword,
                role: 'field_staff',
                userType: 'worker',
                department: 'Sanitation',
                district: 'Central District',
                municipality: 'Central Municipal Corporation',
                ward: 'Ward 1',
                verified: true,
                isActive: true,
                attendance: 88,
                tasks_completed: 32,
                createdBy: superAdmin._id
            },
            {
                name: 'Sunita Patel',
                email: 'sunita.patel@municipal.gov.in',
                phone: '9876543213',
                password: hashedPassword,
                role: 'field_staff',
                userType: 'worker',
                department: 'Electrical',
                district: 'Central District',
                municipality: 'Central Municipal Corporation',
                ward: 'Ward 3',
                verified: true,
                isActive: true,
                attendance: 90,
                tasks_completed: 41,
                createdBy: superAdmin._id
            },
            {
                name: 'Vikash Gupta',
                email: 'vikash.gupta@municipal.gov.in',
                phone: '9876543214',
                password: hashedPassword,
                role: 'department_head',
                adminRole: 'department_head',
                userType: 'admin',
                department: 'Roads and Drainage',
                district: 'Central District',
                municipality: 'Central Municipal Corporation',
                ward: 'All Wards',
                verified: true,
                isActive: true,
                attendance: 97,
                tasks_completed: 52,
                createdBy: superAdmin._id
            },
            {
                name: 'Anjali Verma',
                email: 'anjali.verma@municipal.gov.in',
                phone: '9876543215',
                password: hashedPassword,
                role: 'field_staff',
                userType: 'worker',
                department: 'Parks and Gardens',
                district: 'Central District',
                municipality: 'Central Municipal Corporation',
                ward: 'Ward 2',
                verified: true,
                isActive: false,
                attendance: 75,
                tasks_completed: 28,
                createdBy: superAdmin._id
            }
        ];

        // Check if staff already exist to avoid duplicates
        for (const staff of staffMembers) {
            const existingStaff = await User.findOne({ email: staff.email });
            if (!existingStaff) {
                const newStaff = new User(staff);
                await newStaff.save();
                console.log(`✅ Created staff member: ${staff.name} (${staff.role})`);
            } else {
                console.log(`ℹ️ Staff member already exists: ${staff.name}`);
            }
        }

        // Count total staff created
        const totalStaff = await User.countDocuments({
            role: { $in: ['field_staff', 'field_head', 'department_head'] }
        });

        console.log(`\n📊 Total staff members in system: ${totalStaff}`);

        // Show staff by role
        const departmentHeads = await User.countDocuments({ role: 'department_head' });
        const fieldHeads = await User.countDocuments({ role: 'field_head' });
        const fieldStaff = await User.countDocuments({ role: 'field_staff' });

        console.log(`👑 Department Heads: ${departmentHeads}`);
        console.log(`👨‍💼 Field Heads: ${fieldHeads}`);
        console.log(`👷 Field Staff: ${fieldStaff}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating staff data:', error);
        process.exit(1);
    }
};

createStaffData();