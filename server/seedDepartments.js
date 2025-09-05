const mongoose = require('mongoose');
const Department = require('./models/Department');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/civic-app');
        console.log('MongoDB connected for seeding...');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const seedDepartments = async () => {
    try {
        // Clear existing departments
        await Department.deleteMany({});
        
        const departments = [
            {
                name: 'Public Works Department',
                description: 'Responsible for road maintenance, construction, and infrastructure development',
                head: 'Rajesh Kumar',
                contact: '+91 98765 43210',
                email: 'pwd@sevatrack.gov.in',
                icon: 'Wrench',
                color: 'blue'
            },
            {
                name: 'Sanitation Department',
                description: 'Manages waste collection, street cleaning, and public hygiene',
                head: 'Priya Sharma',
                contact: '+91 98765 43211',
                email: 'sanitation@sevatrack.gov.in',
                icon: 'Recycle',
                color: 'green'
            },
            {
                name: 'Street Lighting Department',
                description: 'Installation and maintenance of street lights and public illumination',
                head: 'Amit Singh',
                contact: '+91 98765 43212',
                email: 'lighting@sevatrack.gov.in',
                icon: 'Lightbulb',
                color: 'yellow'
            },
            {
                name: 'Water Supply Department',
                description: 'Water distribution, pipeline maintenance, and quality management',
                head: 'Deepak Verma',
                contact: '+91 98765 43213',
                email: 'water@sevatrack.gov.in',
                icon: 'Droplets',
                color: 'cyan'
            },
            {
                name: 'Transportation Department',
                description: 'Traffic management, public transport, and road safety',
                head: 'Sunita Devi',
                contact: '+91 98765 43214',
                email: 'transport@sevatrack.gov.in',
                icon: 'Car',
                color: 'purple'
            }
        ];

        await Department.insertMany(departments);
        console.log('Departments seeded successfully!');
        console.log(`Inserted ${departments.length} departments`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding departments:', error);
        process.exit(1);
    }
};

const runSeed = async () => {
    await connectDB();
    await seedDepartments();
};

runSeed();
