const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NotificationService = require('../utils/notificationService');
require('dotenv').config();

// Predefined admin credentials (in production, use proper admin management)
const ADMIN_CREDENTIALS = [
    {
        email: 'bharani@gmail.com',
        name: 'Admin Bharani',
        password: 'password', // plaintext for existing
        role: 'super_admin'
    },
    {
        email: 'ashok@gmail.com',
        name: 'Admin Ashok',
        password: '$2b$10$OApkdLa2.A6ic2omgLZA5uVx7edk8gJdteD2gADJK7ll7Opz5iNeS', // 123456 hashed
        role: 'district_admin'
    },
    {
        email: 'district1@admin.com',
        name: 'District Admin 1',
        password: '$2b$10$YN9OykPdT6DAPRH94Y8L5.R2iVnVZBef3OcaNLstFAEvwXSKgwl.S', // district123 hashed
        role: 'district_admin'
    },
    {
        email: 'municipality1@admin.com',
        name: 'Municipality Admin 1',
        password: '$2b$10$d8YXnIZx4ZNgS0IGhnK3G.kGH9VPAy2qGTESkzfpA06/L4UDhr.j6', // municipality123 hashed
        role: 'municipality_admin'
    },
    {
        email: 'department1@admin.com',
        name: 'Department Head 1',
        password: '$2b$10$8BT4QSNRbNcyVSf/ne3fm.E5A5qci7sxRgwpBsrhEgxJWQdhEA9WK', // department123 hashed
        role: 'department_head'
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
        console.log('🔍 Getting profile for user ID:', req.user.id);
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            console.log('❌ User not found');
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }
        
        console.log('✅ Profile found for user:', user.name);
        res.json({
            success: true,
            user
        });
    } catch (err) {
        console.error('❌ Profile fetch error:', err.message);
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
        console.log('🏆 Fetching leaderboard data...');
        const topUsers = await User.find({ role: 'citizen' })
            .select('name email points badges createdAt')
            .sort({ points: -1 })
            .limit(10);
        
        console.log(`✅ Found ${topUsers.length} citizen users for leaderboard`);
        console.log('Top users:', topUsers.map(u => ({ name: u.name, points: u.points })));
        
        res.json({
            success: true,
            leaderboard: topUsers
        });
    } catch (err) {
        console.error('❌ Leaderboard fetch error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

// @desc    Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await NotificationService.getUserNotifications(req.user.id);
        const unreadCount = await NotificationService.getUnreadCount(req.user.id);
        
        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (err) {
        console.error('Notifications fetch error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

// @desc    Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const notification = await NotificationService.markAsRead(notificationId, req.user.id);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                msg: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (err) {
        console.error('Mark notification read error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

// @desc    Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        await NotificationService.markAllAsRead(req.user.id);
        
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (err) {
        console.error('Mark all notifications read error:', err.message);
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

        // Password will be automatically hashed by the User model pre-save hook
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
    console.log('🔑 Citizen login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
        console.log('❌ Missing credentials:', { email: !!email, password: !!password });
        return res.status(400).json({ 
            success: false,
            msg: 'Email and password are required' 
        });
    }
    
    try {
        console.log('🔍 Looking for citizen with email:', email);
        // Find citizen user
        let user = await User.findOne({ email, role: 'citizen' });
        if (!user) {
            console.log('❌ Citizen not found');
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid credentials - citizen not found' 
            });
        }

        console.log('👤 Found citizen:', user.name);
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Password incorrect');
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid credentials - password incorrect' 
            });
        }

        console.log('✅ Password correct, generating token...');
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

        console.log('🎯 Login successful for:', user.name);
        res.json({ 
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points || 0
            }
        });
    } catch (err) {
        console.error('❌ Citizen login error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error during login' 
        });
    }
};

// @desc    Login admin
exports.loginAdmin = async (req, res) => {
    console.log('=== ADMIN LOGIN FUNCTION CALLED ===');
    console.log('Request body:', req.body);
    const { email, password, role } = req.body;
    console.log('Extracted values:', { email, password, role });
    try {
        console.log('Admin login attempt:', { email, role });
        
        // First, try to find admin user in database (check for any admin role)
        const adminRoles = ['super_admin', 'district_admin', 'municipality_admin', 'department_head', 'field_head'];
        const dbAdmin = await User.findOne({ 
            email: email, 
            role: { $in: adminRoles } 
        });
        
        if (dbAdmin) {
            console.log('Database admin found:', dbAdmin.email);
            console.log('Input password:', JSON.stringify(password));
            console.log('Password length:', password.length);
            console.log('Password type:', typeof password);
            console.log('Stored hash:', dbAdmin.password);
            console.log('Hash length:', dbAdmin.password.length);
            
            // Check password using the User model method
            const isMatch = await dbAdmin.comparePassword(password);
            console.log('Password match:', isMatch);
            
            // Also test with bcrypt directly for debugging
            const directMatch = await bcrypt.compare(password, dbAdmin.password);
            console.log('Direct bcrypt match:', directMatch);
            
            if (isMatch) {
                // Check if the user's role matches the requested role (if specified)
                if (role && dbAdmin.role !== role) {
                    return res.status(401).json({
                        success: false,
                        message: `Access denied. This account is not authorized for ${role.replace('_', ' ')} role.`
                    });
                }
                
                // Update last login
                dbAdmin.lastLogin = new Date();
                await dbAdmin.save();
                
                // Create JWT token for database admin
                const payload = { 
                    user: {
                        id: dbAdmin._id.toString(), 
                        role: dbAdmin.role, // Use the actual role from database
                        email: dbAdmin.email,
                        name: dbAdmin.name,
                        department: dbAdmin.department,
                        municipality: dbAdmin.municipality,
                        district: dbAdmin.district,
                        userType: 'admin'
                    }
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

                return res.json({ 
                    success: true,
                    token,
                    user: {
                        id: dbAdmin._id.toString(),
                        name: dbAdmin.name,
                        email: dbAdmin.email,
                        role: dbAdmin.role, // Use the actual role from database
                        userType: 'admin'
                    },
                    message: `Welcome ${dbAdmin.role.replace('_', ' ')}!`
                });
            }
        }
        
        // Fallback to hardcoded admin credentials for compatibility
        const adminCredential = ADMIN_CREDENTIALS.find(admin => admin.email === email);
        
        if (adminCredential) {
            console.log('Hardcoded admin found:', adminCredential.email, 'with role:', adminCredential.role);
            
            // Check if role matches (if role is provided in request)
            if (role && adminCredential.role !== role) {
                return res.status(401).json({
                    success: false,
                    message: `Access denied. This account is not authorized for ${role.replace('_', ' ')} role.`
                });
            }
            
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
                // Create JWT token for hardcoded admin
                const payload = { 
                    user: {
                        id: `admin_${adminCredential.email.split('@')[0]}`, 
                        role: adminCredential.role,
                        email: adminCredential.email,
                        name: adminCredential.name,
                        userType: 'admin'
                    }
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

                console.log('Admin login successful:', { email, role: adminCredential.role });

                res.json({ 
                    success: true,
                    token,
                    user: {
                        id: `admin_${adminCredential.email.split('@')[0]}`,
                        name: adminCredential.name,
                        email: adminCredential.email,
                        role: adminCredential.role,
                        userType: 'admin'
                    },
                    message: `Welcome ${adminCredential.role.replace('_', ' ')}!`
                });
            } else {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid admin credentials - password incorrect' 
                });
            }
        } else {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid admin credentials - email not found' 
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
        console.log('🔍 getMe called with req.user:', req.user);
        
        // Handle admin users
        if (req.user.id && req.user.id.startsWith('admin_')) {
            console.log('📋 Processing admin user with email:', req.user.email);
            const adminEmail = req.user.email;
            const adminCredential = ADMIN_CREDENTIALS.find(admin => admin.email === adminEmail);
            
            if (adminCredential) {
                console.log('✅ Found admin credential:', adminCredential.name);
                return res.json({
                    success: true,
                    user: {
                        id: req.user.id,
                        name: adminCredential.name,
                        email: adminCredential.email,
                        role: req.user.role || adminCredential.role, // Use the role from token or admin credential
                        userType: 'admin'
                    }
                });
            } else {
                console.log('❌ Admin credential not found for:', adminEmail);
            }
        }

        // Handle worker users
        if (req.user.id && req.user.id.startsWith('worker_')) {
            console.log('👷 Processing worker user with employeeId:', req.user.employeeId);
            const workerEmployeeId = req.user.employeeId;
            const workerCredential = WORKER_CREDENTIALS.find(worker => worker.employeeId === workerEmployeeId);
            
            if (workerCredential) {
                console.log('✅ Found worker credential:', workerCredential.name);
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
            } else {
                console.log('❌ Worker credential not found for:', workerEmployeeId);
            }
        }

        // Handle regular users
        console.log('👤 Processing regular user with id:', req.user.id);
        
        // Check if the ID is a valid MongoDB ObjectId
        if (!req.user.id || !req.user.id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('❌ Invalid ObjectId format:', req.user.id);
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid user ID format' 
            });
        }
        
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            console.log('❌ User not found in database for id:', req.user.id);
            return res.status(404).json({ 
                success: false,
                msg: 'User not found' 
            });
        }

        console.log('✅ Found regular user:', user.name, user.email, user.role);
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                userType: user.userType || 'user',
                district: user.district,
                municipality: user.municipality,
                department: user.department
            }
        });
    } catch (err) {
        console.error('❌ Get user error:', err.message);
        console.error('❌ Full error:', err);
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

// Export worker credentials for use in other controllers
module.exports.WORKER_CREDENTIALS = WORKER_CREDENTIALS;