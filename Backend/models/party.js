const mongoose = require('mongoose');

const politicalPartySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    abbreviation: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    headquarter: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

// Middleware to update `updatedAt` before saving
politicalPartySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Export the model
exports.PoliticalParty = mongoose.model('PoliticalParty', politicalPartySchema);
