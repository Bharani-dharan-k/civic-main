const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    head: { 
        type: String, 
        required: true 
    },
    contact: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email'
        }
    },
    icon: { 
        type: String, 
        default: 'Building2' 
    },
    color: { 
        type: String, 
        enum: ['blue', 'green', 'yellow', 'cyan', 'purple', 'red', 'orange', 'pink'],
        default: 'blue' 
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

// Update the updatedAt field on save
DepartmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for active issues count
DepartmentSchema.virtual('activeIssues', {
    ref: 'Report',
    localField: 'name',
    foreignField: 'assignedDepartment',
    count: true,
    match: { status: { $in: ['assigned', 'in_progress'] } }
});

// Virtual for resolved issues count
DepartmentSchema.virtual('resolvedIssues', {
    ref: 'Report',
    localField: 'name',
    foreignField: 'assignedDepartment',
    count: true,
    match: { status: 'resolved' }
});

// Ensure virtual fields are serialised
DepartmentSchema.set('toJSON', { virtuals: true });
DepartmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Department', DepartmentSchema);
