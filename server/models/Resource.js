const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['vehicle', 'equipment', 'inventory', 'tool'],
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'repair', 'retired', 'unavailable'],
        default: 'active'
    },
    department: {
        type: String,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    specifications: {
        model: String,
        manufacturer: String,
        year: Number,
        serialNumber: String,
        capacity: String
    },
    maintenance: [{
        date: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            enum: ['routine', 'repair', 'inspection'],
            required: true
        },
        description: String,
        cost: Number,
        performedBy: String,
        nextMaintenanceDate: Date
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
    purchaseInfo: {
        date: Date,
        cost: Number,
        vendor: String,
        warrantyExpiry: Date
    },
    inventory: {
        currentStock: {
            type: Number,
            default: 0
        },
        minimumStock: {
            type: Number,
            default: 0
        },
        unit: String
    }
}, {
    timestamps: true
});

resourceSchema.index({ type: 1, department: 1 });
resourceSchema.index({ status: 1 });

module.exports = mongoose.model('Resource', resourceSchema);