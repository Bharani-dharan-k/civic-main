const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Report = require('./models/Report');
require('dotenv').config();

const seedCitizenData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB...');

        // Create sample citizen users with different point levels
        const citizens = [
            {
                name: 'Rajesh Kumar',
                email: 'rajesh@example.com',
                password: 'password123',
                phone: '+91-9876543210',
                role: 'citizen',
                points: 2450,
                bio: 'Active community member who reports municipal issues regularly.',
                location: 'Sector 12, Delhi',
                badges: [
                    { name: 'First Reporter', icon: '🎯', earnedAt: new Date() },
                    { name: 'Community Guardian', icon: '🛡️', earnedAt: new Date() },
                    { name: 'Top Performer', icon: '🏆', earnedAt: new Date() }
                ]
            },
            {
                name: 'Priya Sharma',
                email: 'priya@example.com',
                password: 'password123',
                phone: '+91-9876543211',
                role: 'citizen',
                points: 2120,
                bio: 'Environmental advocate focused on waste management issues.',
                location: 'Sector 15, Delhi',
                badges: [
                    { name: 'Eco Warrior', icon: '🌱', earnedAt: new Date() },
                    { name: 'Problem Solver', icon: '🔧', earnedAt: new Date() }
                ]
            },
            {
                name: 'Amit Patel',
                email: 'amit@example.com',
                password: 'password123',
                phone: '+91-9876543212',
                role: 'citizen',
                points: 1850,
                bio: 'Tech professional interested in smart city initiatives.',
                location: 'Sector 20, Delhi',
                badges: [
                    { name: 'Tech Savvy', icon: '💻', earnedAt: new Date() }
                ]
            },
            {
                name: 'Sunita Devi',
                email: 'sunita@example.com',
                password: 'password123',
                phone: '+91-9876543213',
                role: 'citizen',
                points: 1650,
                bio: 'Homemaker dedicated to neighborhood cleanliness.',
                location: 'Sector 8, Delhi',
                badges: [
                    { name: 'Clean Community', icon: '🧹', earnedAt: new Date() }
                ]
            },
            {
                name: 'Vikram Singh',
                email: 'vikram@example.com',
                password: 'password123',
                phone: '+91-9876543214',
                role: 'citizen',
                points: 1420,
                bio: 'Student volunteer for social causes.',
                location: 'Sector 25, Delhi',
                badges: [
                    { name: 'Young Leader', icon: '🌟', earnedAt: new Date() }
                ]
            }
        ];

        // Hash passwords and create users
        for (let citizenData of citizens) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: citizenData.email });
            if (existingUser) {
                console.log(`User ${citizenData.email} already exists, skipping...`);
                continue;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            citizenData.password = await bcrypt.hash(citizenData.password, salt);

            // Create user
            const user = new User(citizenData);
            await user.save();
            console.log(`✅ Created citizen: ${citizenData.name} (${citizenData.email})`);

            // Create some sample reports for each user
            const reportCount = Math.floor(Math.random() * 10) + 3; // 3-13 reports per user
            
            for (let i = 0; i < reportCount; i++) {
                const categories = ['pothole', 'streetlight', 'garbage', 'drainage', 'maintenance'];
                const statuses = ['submitted', 'acknowledged', 'in_progress', 'resolved'];
                const priorities = ['Low', 'Medium', 'High'];
                
                const longitude = 77.2090 + (Math.random() - 0.5) * 0.1;
                const latitude = 28.6139 + (Math.random() - 0.5) * 0.1;
                
                const report = new Report({
                    title: `Issue ${i + 1}: ${categories[Math.floor(Math.random() * categories.length)]} problem`,
                    description: `Detailed description of ${categories[Math.floor(Math.random() * categories.length)]} issue reported by ${citizenData.name}. This needs immediate attention.`,
                    category: categories[Math.floor(Math.random() * categories.length)],
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    priority: priorities[Math.floor(Math.random() * priorities.length)],
                    location: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    address: citizenData.location,
                    imageUrl: 'https://via.placeholder.com/400x300?text=Report+Image',
                    reportedBy: user._id,
                    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
                });
                
                await report.save();
            }
            console.log(`   📝 Created ${reportCount} reports for ${citizenData.name}`);
        }

        console.log('\n🎉 Citizen data seeded successfully!');
        console.log('👥 Sample citizens created with points and reports');
        console.log('🔑 All citizens have password: password123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding citizen data:', error.message);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    seedCitizenData();
}

module.exports = seedCitizenData;
