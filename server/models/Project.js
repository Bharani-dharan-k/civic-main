const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    projectManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['planning', 'ongoing', 'completed', 'onhold', 'cancelled'],
        default: 'planning'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    actualEndDate: Date,
    budget: {
        allocated: {
            type: Number,
            required: true
        },
        spent: {
            type: Number,
            default: 0
        }
    },
    milestones: [{
        title: String,
        description: String,
        targetDate: Date,
        completedDate: Date,
        status: {
            type: String,
            enum: ['pending', 'completed', 'delayed'],
            default: 'pending'
        }
    }],
    team: [{
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: String,
        assignedDate: {
            type: Date,
            default: Date.now
        }
    }],
    resources: [{
        resource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource'
        },
        quantity: Number,
        allocatedDate: Date
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        },
        address: String
    },
    contractors: [{
        name: String,
        contact: String,
        workScope: String,
        contractValue: Number
    }],
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
}, {
    timestamps: true
});

projectSchema.index({ department: 1, status: 1 });
projectSchema.index({ projectManager: 1 });

module.exports = mongoose.model('Project', projectSchema);