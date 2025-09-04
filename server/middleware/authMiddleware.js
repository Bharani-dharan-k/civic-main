const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log('🔐 Token received:', token.substring(0, 20) + '...');

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            console.log('🔓 Token decoded:', decoded);

            // Handle admin users (support multiple admin accounts)
            if (decoded.user && decoded.user.id && decoded.user.id.startsWith('admin_')) {
                req.user = {
                    id: decoded.user.id,
                    role: decoded.user.role || 'admin',
                    email: decoded.user.email,
                    name: decoded.user.name
                };
                return next();
            }

            // Handle worker users (support multiple worker accounts)
            if (decoded.user && decoded.user.id && decoded.user.id.startsWith('worker_')) {
                req.user = {
                    id: decoded.user.id,
                    role: decoded.user.role || 'worker',
                    email: decoded.user.email,
                    name: decoded.user.name,
                    specialization: decoded.user.specialization,
                    phone: decoded.user.phone
                };
                return next();
            }

            // Handle regular users - support both old and new token formats
            const userId = decoded.user ? decoded.user.id : decoded.id;
            
            // Skip database lookup for admin and worker users (they're hardcoded)
            if (userId && (userId.startsWith('admin_') || userId.startsWith('worker_'))) {
                return res.status(401).json({ 
                    success: false,
                    msg: 'Special user token format error' 
                });
            }
            
            // Get user from the token
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    msg: 'Not authorized, user not found' 
                });
            }

            req.user = {
                id: user.id,
                role: user.role,
                email: user.email,
                name: user.name
            };
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.status(401).json({ 
                success: false,
                msg: 'Not authorized, token failed' 
            });
        }
    } else {
        res.status(401).json({ 
            success: false,
            msg: 'Not authorized, no token provided' 
        });
    }
};

// Middleware to check for admin role
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false,
            msg: 'Access denied. Admin privileges required.' 
        });
    }
};

// Middleware to check for citizen role
exports.citizen = (req, res, next) => {
    if (req.user && req.user.role === 'citizen') {
        next();
    } else {
        res.status(403).json({ 
            success: false,
            msg: 'Access denied. Citizen privileges required.' 
        });
    }
};

// Middleware to check for worker role
exports.worker = (req, res, next) => {
    if (req.user && req.user.role === 'worker') {
        next();
    } else {
        res.status(403).json({ 
            success: false,
            msg: 'Access denied. Worker privileges required.' 
        });
    }
};