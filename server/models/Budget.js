const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    financialYear: {
        type: String,
        required: true
    },
    totalAllocated: {
        type: Number,
        required: true
    },
    categories: [{
        name: String,
        allocated: Number,
        spent: {
            type: Number,
            default: 0
        }
    }],
    monthlyExpenditure: [{
        month: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        categories: [{
            name: String,
            amount: Number
        }]
    }],
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['draft', 'approved', 'active', 'closed'],
        default: 'draft'
    }
}, {
    timestamps: true
});

budgetSchema.index({ department: 1, financialYear: 1 });

module.exports = mongoose.model('Budget', budgetSchema);