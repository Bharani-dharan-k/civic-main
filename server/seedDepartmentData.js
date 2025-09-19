const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Staff = require('./models/Staff');
const Task = require('./models/Task');
const Resource = require('./models/Resource');
const Project = require('./models/Project');
const Budget = require('./models/Budget');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

const seedDepartmentData = async () => {
    try {
        await connectDB();
        
        console.log('🌱 Seeding department data...');

        // Create sample staff users
        const departmentHead = await User.findOne({ role: 'department_head' });
        
        const staffUsers = [
            {
                name: 'Rajesh Kumar',
                email: 'rajesh.supervisor@municipal.gov.in',
                phone: '+91 98765 43210',
                role: 'field_staff',
                password: await bcrypt.hash('staff123', 10),
                district: 'Bokaro',
                municipality: 'Bokaro Steel City',
                department: 'sanitation',
                createdBy: departmentHead._id
            },
            {
                name: 'Priya Patel',
                email: 'priya.inspector@municipal.gov.in',
                phone: '+91 98765 43211',
                role: 'field_staff',
                password: await bcrypt.hash('staff123', 10),
                district: 'Bokaro',
                municipality: 'Bokaro Steel City',
                department: 'health',
                createdBy: departmentHead._id
            },
            {
                name: 'Amit Singh',
                email: 'amit.worker@municipal.gov.in',
                phone: '+91 98765 43212',
                role: 'field_staff',
                password: await bcrypt.hash('staff123', 10),
                district: 'Bokaro',
                municipality: 'Bokaro Steel City',
                department: 'sanitation',
                createdBy: departmentHead._id
            },
            {
                name: 'Sunita Sharma',
                email: 'sunita.technician@municipal.gov.in',
                phone: '+91 98765 43213',
                role: 'field_staff',
                password: await bcrypt.hash('staff123', 10),
                district: 'Bokaro',
                municipality: 'Bokaro Steel City',
                department: 'water',
                createdBy: departmentHead._id
            },
            {
                name: 'Vikram Yadav',
                email: 'vikram.operator@municipal.gov.in',
                phone: '+91 98765 43214',
                role: 'field_staff',
                password: await bcrypt.hash('staff123', 10),
                district: 'Bokaro',
                municipality: 'Bokaro Steel City',
                department: 'infrastructure',
                createdBy: departmentHead._id
            }
        ];

        // Clear existing data
        await User.deleteMany({ role: 'field_staff' });
        await Staff.deleteMany({});
        await Task.deleteMany({});
        await Resource.deleteMany({});
        await Project.deleteMany({});
        await Budget.deleteMany({});

        // Create staff users
        const createdUsers = [];
        for (const userData of staffUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
        }

        // Create staff records
        const staffData = [
            {
                employeeId: 'EMP001',
                user: createdUsers[0]._id,
                department: 'sanitation',
                position: 'Field Supervisor',
                status: 'active',
                attendance: [
                    { date: new Date('2025-09-01'), status: 'present' },
                    { date: new Date('2025-09-02'), status: 'present' },
                    { date: new Date('2025-09-03'), status: 'present' },
                    { date: new Date('2025-09-04'), status: 'present' },
                    { date: new Date('2025-09-05'), status: 'absent' }
                ]
            },
            {
                employeeId: 'EMP002',
                user: createdUsers[1]._id,
                department: 'health',
                position: 'Health Inspector',
                status: 'active',
                attendance: [
                    { date: new Date('2025-09-01'), status: 'present' },
                    { date: new Date('2025-09-02'), status: 'present' },
                    { date: new Date('2025-09-03'), status: 'present' },
                    { date: new Date('2025-09-04'), status: 'late' },
                    { date: new Date('2025-09-05'), status: 'present' }
                ]
            },
            {
                employeeId: 'EMP003',
                user: createdUsers[2]._id,
                department: 'sanitation',
                position: 'Sanitation Worker',
                status: 'leave',
                attendance: [
                    { date: new Date('2025-09-01'), status: 'present' },
                    { date: new Date('2025-09-02'), status: 'present' },
                    { date: new Date('2025-09-03'), status: 'leave' },
                    { date: new Date('2025-09-04'), status: 'leave' },
                    { date: new Date('2025-09-05'), status: 'leave' }
                ]
            },
            {
                employeeId: 'EMP004',
                user: createdUsers[3]._id,
                department: 'water',
                position: 'Water Technician',
                status: 'active',
                attendance: [
                    { date: new Date('2025-09-01'), status: 'present' },
                    { date: new Date('2025-09-02'), status: 'present' },
                    { date: new Date('2025-09-03'), status: 'present' },
                    { date: new Date('2025-09-04'), status: 'present' },
                    { date: new Date('2025-09-05'), status: 'present' }
                ]
            },
            {
                employeeId: 'EMP005',
                user: createdUsers[4]._id,
                department: 'infrastructure',
                position: 'Equipment Operator',
                status: 'active',
                attendance: [
                    { date: new Date('2025-09-01'), status: 'present' },
                    { date: new Date('2025-09-02'), status: 'present' },
                    { date: new Date('2025-09-03'), status: 'present' },
                    { date: new Date('2025-09-04'), status: 'absent' },
                    { date: new Date('2025-09-05'), status: 'present' }
                ]
            }
        ];

        const createdStaff = [];
        for (const staff of staffData) {
            const newStaff = new Staff(staff);
            await newStaff.save();
            createdStaff.push(newStaff);
        }

        // Create sample tasks
        const tasks = [
            {
                title: 'Street Cleaning - Ward 5',
                description: 'Clean main street and surrounding areas in Ward 5',
                priority: 'high',
                status: 'assigned',
                assignedTo: createdUsers[0]._id,
                assignedBy: departmentHead._id,
                deadline: new Date('2025-09-25')
            },
            {
                title: 'Water Quality Testing',
                description: 'Test water quality in residential areas',
                priority: 'medium',
                status: 'in_progress',
                assignedTo: createdUsers[3]._id,
                assignedBy: departmentHead._id,
                deadline: new Date('2025-09-22')
            },
            {
                title: 'Health Camp Setup',
                description: 'Setup mobile health camp in rural areas',
                priority: 'low',
                status: 'completed',
                assignedTo: createdUsers[1]._id,
                assignedBy: departmentHead._id,
                deadline: new Date('2025-09-20'),
                completedAt: new Date('2025-09-19')
            }
        ];

        for (const task of tasks) {
            const newTask = new Task(task);
            await newTask.save();
        }

        // Create sample resources
        const resources = [
            {
                name: 'Garbage Truck - GJ01AB1234',
                type: 'vehicle',
                category: 'Sanitation Vehicle',
                status: 'active',
                department: 'sanitation',
                assignedTo: createdUsers[0]._id,
                specifications: {
                    model: 'Tata LPT 1613',
                    manufacturer: 'Tata Motors',
                    year: 2023,
                    capacity: '10 tons'
                }
            },
            {
                name: 'Water Testing Kit',
                type: 'equipment',
                category: 'Testing Equipment',
                status: 'maintenance',
                department: 'water',
                specifications: {
                    model: 'AquaTest Pro',
                    manufacturer: 'WaterTech Solutions'
                }
            },
            {
                name: 'Medical Supplies',
                type: 'inventory',
                category: 'Healthcare Supplies',
                status: 'active',
                department: 'health',
                inventory: {
                    currentStock: 75,
                    minimumStock: 20,
                    unit: 'boxes'
                }
            }
        ];

        for (const resource of resources) {
            const newResource = new Resource(resource);
            await newResource.save();
        }

        // Create sample projects
        const projects = [
            {
                name: 'New Water Tank Installation',
                description: 'Install new water storage tank for Ward 3',
                department: 'water',
                projectManager: await User.findOne({ role: 'department_head' }),
                status: 'ongoing',
                priority: 'high',
                startDate: new Date('2025-08-01'),
                endDate: new Date('2025-10-15'),
                budget: {
                    allocated: 5000000,
                    spent: 3250000
                },
                progress: 65,
                milestones: [
                    {
                        title: 'Site Preparation',
                        status: 'completed',
                        targetDate: new Date('2025-08-15'),
                        completedDate: new Date('2025-08-14')
                    },
                    {
                        title: 'Foundation Work',
                        status: 'completed',
                        targetDate: new Date('2025-08-30'),
                        completedDate: new Date('2025-08-29')
                    },
                    {
                        title: 'Tank Installation',
                        status: 'pending',
                        targetDate: new Date('2025-09-30')
                    }
                ]
            },
            {
                name: 'Health Camp Mobile Unit',
                description: 'Setup mobile health screening unit',
                department: 'health',
                projectManager: await User.findOne({ role: 'department_head' }),
                status: 'ongoing',
                priority: 'medium',
                startDate: new Date('2025-09-01'),
                endDate: new Date('2025-09-25'),
                budget: {
                    allocated: 1500000,
                    spent: 1350000
                },
                progress: 90
            }
        ];

        for (const project of projects) {
            if (project.projectManager) {
                project.projectManager = project.projectManager._id;
                const newProject = new Project(project);
                await newProject.save();
            }
        }

        // Create sample budget
        const budget = new Budget({
            department: 'sanitation',
            financialYear: '2025',
            totalAllocated: 50000000,
            categories: [
                { name: 'Operations', allocated: 20000000, spent: 12000000 },
                { name: 'Maintenance', allocated: 15000000, spent: 8500000 },
                { name: 'Equipment', allocated: 10000000, spent: 7200000 },
                { name: 'Staff', allocated: 5000000, spent: 4300000 }
            ],
            monthlyExpenditure: [
                { month: 'April', amount: 4500000 },
                { month: 'May', amount: 5200000 },
                { month: 'June', amount: 4800000 },
                { month: 'July', amount: 5500000 },
                { month: 'August', amount: 6200000 },
                { month: 'September', amount: 5800000 }
            ],
            status: 'active'
        });

        await budget.save();

        console.log('✅ Department data seeded successfully!');
        console.log(`Created ${createdUsers.length} staff users`);
        console.log(`Created ${createdStaff.length} staff records`);
        console.log('Created sample tasks, resources, projects, and budget');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedDepartmentData();