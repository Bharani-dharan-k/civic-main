const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['pothole', 'streetlight', 'garbage', 'drainage', 'maintenance', 'electrical', 'plumbing', 'cleaning', 'other'],
        required: true
    },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    address: { type: String, required: true },
    ward: { type: String },
    district: { type: String },
    urbanLocalBody: { type: String },
    imageUrl: { type: String, required: true },
    videoUrl: { type: String },
    status: {
        type: String,
        enum: ['submitted', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'],
        default: 'submitted'
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { 
        type: String // worker employee ID instead of ObjectId for simplicity
    },
    assignedDepartment: { type: String }, // Department assigned to handle the report
    assignedBy: { type: mongoose.Schema.Types.Mixed }, // admin ID (string) or user ObjectId
    assignedAt: { type: Date },
    resolutionImageUrl: { type: String }, // 'After' photo from worker
    adminNotes: [{
        note: String,
        addedBy: { type: mongoose.Schema.Types.Mixed }, // admin ID (string) or user ObjectId
        addedAt: { type: Date, default: Date.now }
    }],
    workerNotes: [{
        note: String,
        addedBy: String, // worker ID
        addedAt: { type: Date, default: Date.now },
        location: {
            latitude: Number,
            longitude: Number
        }
    }],
    workProgressPhotos: [{
        url: String,
        uploadedBy: String, // worker ID
        uploadedAt: { type: Date, default: Date.now },
        type: { type: String, enum: ['progress', 'completion'], default: 'progress' }
    }],
    citizenComments: [{
        comment: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now }
    }],
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        submittedAt: { type: Date, default: Date.now }
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    estimatedResolutionTime: { type: Number }, // in days
    workerStartedAt: { type: Date },
    actualResolutionTime: { type: Number }, // calculated in hours
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date }
});

ReportSchema.index({ location: '2dsphere' }); // For geospatial queries

module.exports = mongoose.model('Report', ReportSchema);