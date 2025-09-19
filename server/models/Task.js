const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['assigned', 'in_progress', 'completed', 'cancelled'],
        default: 'assigned'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        default: 'general'
    },
    deadline: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    notes: [{
        text: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    relatedReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);