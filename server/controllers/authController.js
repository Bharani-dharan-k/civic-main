const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Predefined admin credentials (in production, use proper admin management)
const ADMIN_CREDENTIALS = [
    {
        email: 'bharani@gmail.com',
        name: 'Admin Bharani',
        password: 'bharani5544' // plaintext for existing
    },
    {
        email: 'ashok@gmail.com',
        name: 'Admin Ashok',
        password: '$2b$10$OApkdLa2.A6ic2omgLZA5uVx7edk8gJdteD2gADJK7ll7Opz5iNeS' // 123456 hashed
    }
];

// Predefined worker credentials (in production, use proper worker management)
const WORKER_CREDENTIALS = [
    {
        employeeId: 'FIELD001',
        email: 'worker1@sevatrack.com',
        name: 'Field Worker 1 - Ram',
        password: '$2b$10$OApkdLa2.A6ic2omgLZA5uVx7edk8gJdteD2gADJK7ll7Opz5iNeS', // 123456 hashed
        specialization: 'General Maintenance',
        phone: '+91-9876543210'
    },
    {
        employeeId: 'TECH002',
        email: 'technician@sevatrack.com', 
        name: 'Technician Raj Kumar',
        password: '$2b$10$OApkdLa2.A6ic2omgLZA5uVx7edk8gJdteD2gADJK7ll7Opz5iNeS', // 123456 hashed
        specialization: 'Electrical & Plumbing',
        phone: '+91-9876543211'
    },
    {
        employeeId: 'CLEAN003',
        email: 'cleaner@sevatrack.com',
        name: 'Sanitation Worker - Suresh',
        password: '$2b$10$OApkdLa2.A6ic2omgLZA5uVx7edk8gJdteD2gADJK7ll7Opz5iNeS', // 123456 hashed
        specialization: 'Waste Management',
        phone: '+91-9876543212'
    },
    {
        employeeId: 'MECH004',
        email: 'mechanic@sevatrack.com',
        name: 'Mechanic - Ravi',
        password: '$2b$10$OApkdLa2.A6ic2omgLZA5uVx7edk8gJdteD2gADJK7ll7Opz5iNeS', // 123456 hashed
        specialization: 'Vehicle Maintenance',
        phone: '+91-9876543213'
    },
    {
        employeeId: 'ELEC005',
        email: 'electrician@sevatrack.com',
        name: 'Electrician - Mohan',
        password: '$2b$10$OApkdLa2.A6ic2omgLZA5uVx7edk8gJdteD2gADJK7ll7Opz5iNeS', // 123456 hashed
        specialization: 'Electrical Work',
        phone: '+91-9876543214'
    },
    {
        employeeId: 'PLUMB006',
        email: 'plumber@sevatrack.com',
        name: 'Plumber - Vijay',
        password: '$2b$10$OApkdLa2.A6ic2omgLZA5uVx7edk8gJdteD2gADJK7ll7Opz5iNeS', // 123456 hashed
        specialization: 'Plumbing Work',
        phone: '+91-9876543215'
    }
];

console.log('🔥 AuthController loaded with', ADMIN_CREDENTIALS.length, 'admin accounts and', WORKER_CREDENTIALS.length, 'worker accounts');

// Track logged-in workers
let loggedInWorkers = new Set();

// Initialize some workers as active by default (for demo purposes)
loggedInWorkers.add('FIELD001');
loggedInWorkers.add('TECH002');
loggedInWorkers.add('CLEAN003');
console.log('🔥 Pre-loaded active workers:', Array.from(loggedInWorkers));


// @desc    Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('reports');
        res.json({
            success: true,
            user
        });
    } catch (err) {
        console.error('Profile fetch error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

// @desc    Update user profile
exports.updateProfile = async (req, res) => {
    const { name, phone, bio, location } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone, bio, location },
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({
            success: true,
            user
        });
    } catch (err) {
        console.error('Profile update error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

// @desc    Get leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({ role: 'citizen' })
            .select('name email points badges createdAt')
            .sort({ points: -1 })
            .limit(10);
        
        res.json({
            success: true,
            leaderboard: topUsers
        });
    } catch (err) {
        console.error('Leaderboard fetch error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

// @desc    Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        // For now, return mock notifications
        // In a real app, you'd have a Notification model
        const notifications = [
            {
                id: 1,
                message: 'Your report has been acknowledged',
                type: 'report_update',
                read: false,
                createdAt: new Date()
            },
            {
                id: 2,
                message: 'You earned 10 points!',
                type: 'points',
                read: false,
                createdAt: new Date()
            }
        ];
        
        res.json({
            success: true,
            notifications
        });
    } catch (err) {
        console.error('Notifications fetch error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

// @desc    Register a new citizen user
exports.registerCitizen = async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ 
                success: false,
                msg: 'User with this email already exists' 
            });
        }

        // Create new citizen user
        user = new User({ 
            name, 
            email, 
            password, 
            phone,
            role: 'citizen' 
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Create JWT token
        const payload = { 
            user: {
                id: user.id, 
                role: user.role,
                email: user.email,
                name: user.name
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

        res.json({ 
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Citizen registration error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error during registration' 
        });
    }
};

// @desc    Login citizen
exports.loginCitizen = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find citizen user
        let user = await User.findOne({ email, role: 'citizen' });
        if (!user) {
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid credentials - citizen not found' 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid credentials - password incorrect' 
            });
        }

        // Create JWT token
        const payload = { 
            user: {
                id: user.id, 
                role: user.role,
                email: user.email,
                name: user.name
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

        res.json({ 
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Citizen login error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error during login' 
        });
    }
};

// @desc    Login admin
exports.loginAdmin = async (req, res) => {
    console.log('=== ADMIN LOGIN FUNCTION CALLED ===');
    const { email, password } = req.body;
    try {
        console.log('Admin login attempt:', { email, password });
        
        // Find admin credentials by email
        const adminCredential = ADMIN_CREDENTIALS.find(admin => admin.email === email);
        
        if (adminCredential) {
            console.log('Admin found:', adminCredential.email);
            let isMatch = false;
            
            // Check if password is hashed or plaintext
            if (adminCredential.password.startsWith('$2b$')) {
                // Hashed password - use bcrypt
                isMatch = await bcrypt.compare(password, adminCredential.password);
            } else {
                // Plaintext password - direct comparison
                isMatch = password === adminCredential.password;
            }
            
            console.log('Password match:', isMatch);
            
            if (isMatch) {
                // Create JWT token for admin
                const payload = { 
                    user: {
                        id: `admin_${adminCredential.email.split('@')[0]}`, 
                        role: 'admin',
                        email: adminCredential.email,
                        name: adminCredential.name
                    }
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

                res.json({ 
                    success: true,
                    token,
                    user: {
                        id: `admin_${adminCredential.email.split('@')[0]}`,
                        name: adminCredential.name,
                        email: adminCredential.email,
                        role: 'admin'
                    }
                });
            } else {
                return res.status(400).json({ 
                    success: false,
                    msg: 'Invalid admin credentials - password incorrect' 
                });
            }
        } else {
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid admin credentials - email not found' 
            });
        }
    } catch (err) {
        console.error('Admin login error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error during admin login' 
        });
    }
};

// @desc    Login worker
exports.loginWorker = async (req, res) => {
    console.log('=== WORKER LOGIN FUNCTION CALLED ===');
    const { employeeId, password } = req.body;
    try {
        console.log('Worker login attempt:', { employeeId, password });
        
        // Find worker credentials by employeeId
        const workerCredential = WORKER_CREDENTIALS.find(worker => worker.employeeId === employeeId);
        
        if (workerCredential) {
            console.log('Worker found:', workerCredential.employeeId);
            let isMatch = false;
            
            // Check if password is hashed or plaintext
            if (workerCredential.password.startsWith('$2b$')) {
                // Hashed password - use bcrypt
                isMatch = await bcrypt.compare(password, workerCredential.password);
            } else {
                // Plaintext password - direct comparison
                isMatch = password === workerCredential.password;
            }
            
            console.log('Password match:', isMatch);
            
            if (isMatch) {
                // Add worker to logged-in set
                loggedInWorkers.add(workerCredential.employeeId);
                console.log('Worker logged in:', workerCredential.employeeId, 'Active workers:', Array.from(loggedInWorkers));
                
                // Create JWT token for worker
                const payload = { 
                    user: {
                        id: `worker_${workerCredential.employeeId}`, 
                        role: 'worker',
                        employeeId: workerCredential.employeeId,
                        email: workerCredential.email,
                        name: workerCredential.name,
                        specialization: workerCredential.specialization,
                        phone: workerCredential.phone
                    }
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

                res.json({ 
                    success: true,
                    token,
                    user: {
                        id: `worker_${workerCredential.employeeId}`,
                        employeeId: workerCredential.employeeId,
                        name: workerCredential.name,
                        email: workerCredential.email,
                        role: 'worker',
                        specialization: workerCredential.specialization,
                        phone: workerCredential.phone
                    }
                });
            } else {
                return res.status(400).json({ 
                    success: false,
                    msg: 'Invalid worker credentials - password incorrect' 
                });
            }
        } else {
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid worker credentials - employee ID not found' 
            });
        }
    } catch (err) {
        console.error('Worker login error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error during worker login' 
        });
    }
};

// @desc    Get logged in user
exports.getMe = async (req, res) => {
    try {
        // Handle admin users
        if (req.user.id.startsWith('admin_')) {
            const adminEmail = req.user.email;
            const adminCredential = ADMIN_CREDENTIALS.find(admin => admin.email === adminEmail);
            
            if (adminCredential) {
                return res.json({
                    success: true,
                    user: {
                        id: req.user.id,
                        name: adminCredential.name,
                        email: adminCredential.email,
                        role: 'admin'
                    }
                });
            }
        }

        // Handle worker users
        if (req.user.id.startsWith('worker_')) {
            const workerEmployeeId = req.user.employeeId;
            const workerCredential = WORKER_CREDENTIALS.find(worker => worker.employeeId === workerEmployeeId);
            
            if (workerCredential) {
                return res.json({
                    success: true,
                    user: {
                        id: req.user.id,
                        employeeId: workerCredential.employeeId,
                        name: workerCredential.name,
                        email: workerCredential.email,
                        role: 'worker',
                        specialization: workerCredential.specialization,
                        phone: workerCredential.phone
                    }
                });
            }
        }

        // Handle regular users
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                msg: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (err) {
        console.error('Get user error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

// @desc    Verify token
exports.verifyToken = async (req, res) => {
    try {
        // Handle admin users
        if (req.user.id.startsWith('admin_')) {
            const adminEmail = req.user.email;
            const adminCredential = ADMIN_CREDENTIALS.find(admin => admin.email === adminEmail);
            
            if (adminCredential) {
                return res.json({
                    success: true,
                    valid: true,
                    user: {
                        id: req.user.id,
                        name: adminCredential.name,
                        email: adminCredential.email,
                        role: 'admin'
                    }
                });
            }
        }

        // Handle worker users
        if (req.user.id.startsWith('worker_')) {
            const workerEmployeeId = req.user.employeeId;
            const workerCredential = WORKER_CREDENTIALS.find(worker => worker.employeeId === workerEmployeeId);
            
            if (workerCredential) {
                return res.json({
                    success: true,
                    valid: true,
                    user: {
                        id: req.user.id,
                        employeeId: workerCredential.employeeId,
                        name: workerCredential.name,
                        email: workerCredential.email,
                        role: 'worker',
                        specialization: workerCredential.specialization,
                        phone: workerCredential.phone
                    }
                });
            }
        }

        // Handle regular users
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(401).json({ 
                success: false,
                valid: false,
                msg: 'Token is not valid' 
            });
        }

        res.json({
            success: true,
            valid: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ 
            success: false,
            valid: false,
            msg: 'Token is not valid' 
        });
    }
};

// @desc    Get active workers for assignment
exports.getActiveWorkers = async (req, res) => {
    try {
        // Get all workers with their status
        const workersWithStatus = WORKER_CREDENTIALS.map(worker => ({
            employeeId: worker.employeeId,
            name: worker.name,
            specialization: worker.specialization,
            phone: worker.phone,
            email: worker.email,
            isActive: loggedInWorkers.has(worker.employeeId),
            status: loggedInWorkers.has(worker.employeeId) ? 'Active' : 'Inactive'
        }));

        console.log('Fetching all workers with status:', workersWithStatus.length, 'total workers');

        res.json({
            success: true,
            workers: workersWithStatus,
            count: workersWithStatus.length,
            activeCount: Array.from(loggedInWorkers).length
        });
    } catch (err) {
        console.error('Get active workers error:', err.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};