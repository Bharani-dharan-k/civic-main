const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    phone: {
        type: String,
        required: function() {
            return this.role === 'citizen';
        }
    },
    role: {
        type: String,
        enum: ['citizen', 'field_staff', 'field_head', 'department_head', 'municipality_admin', 'district_admin', 'state_admin', 'super_admin'],
        default: 'citizen'
    },
    adminRole: {
        type: String,
        enum: ['super_admin', 'district_admin', 'municipality_admin', 'department_head', 'field_head', 'state_admin'],
        required: function() {
            return ['super_admin', 'district_admin', 'municipality_admin', 'department_head', 'field_head', 'state_admin'].includes(this.role);
        }
    },
    district: {
        type: String,
        required: function() {
            return ['district_admin', 'municipality_admin', 'department_head', 'field_head', 'field_staff'].includes(this.role);
        }
    },
    municipality: {
        type: String,
        required: function() {
            return ['municipality_admin', 'department_head', 'field_head', 'field_staff'].includes(this.role);
        }
    },
    ward: {
        type: String,
        required: function() {
            return this.role === 'municipality_admin';
        }
    },
    points: { 
        type: Number, 
        default: 0 
    },
    badges: [{
        name: String,
        icon: String,
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }],
    bio: {
        type: String,
        maxlength: 500
    },
    location: {
        type: String,
        maxlength: 100
    },
    designation: {
        type: String,
        maxlength: 100
    },
    department: {
        type: String,
        required: function() {
            return ['department_head', 'field_head', 'field_staff'].includes(this.role);
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return ['municipality_admin', 'department_head', 'field_head', 'field_staff'].includes(this.role);
        }
    },
    avatar: {
        type: String
    },
    lastLogin: {
        type: Date
    },
    notificationSettings: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        issueAssignment: {
            type: Boolean,
            default: true
        },
        issueResolution: {
            type: Boolean,
            default: true
        },
        systemAlerts: {
            type: Boolean,
            default: true
        },
        weeklyReports: {
            type: Boolean,
            default: false
        },
        monthlyReports: {
            type: Boolean,
            default: true
        }
    },
    systemSettings: {
        autoAssignment: {
            type: Boolean,
            default: true
        },
        priorityBasedRouting: {
            type: Boolean,
            default: true
        },
        citizenFeedback: {
            type: Boolean,
            default: true
        },
        publicDashboard: {
            type: Boolean,
            default: false
        },
        issueTimeout: {
            type: String,
            default: '48'
        },
        maxFileSize: {
            type: String,
            default: '10'
        },
        allowedFileTypes: {
            type: String,
            default: 'jpg,jpeg,png,pdf'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 10
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);