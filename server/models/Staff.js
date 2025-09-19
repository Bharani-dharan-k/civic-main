const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'leave', 'suspended'],
        default: 'active'
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    leaveBalance: {
        type: Number,
        default: 20
    },
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        checkIn: Date,
        checkOut: Date,
        status: {
            type: String,
            enum: ['present', 'absent', 'late', 'halfday', 'leave'],
            default: 'present'
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: [Number]
        }
    }],
    skills: [String],
    certifications: [{
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date
    }],
    performanceRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    }
}, {
    timestamps: true
});

staffSchema.index({ employeeId: 1 });
staffSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Staff', staffSchema);