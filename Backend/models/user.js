const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 120
    },
    location: {
        type: String,
        required: true
    },
    identityDocument: {
        type: String,
        required: false,
        default: ''
    },
    isCandidate: {
        type: Boolean,
        required: true,
        default: false
    },
    politicalParty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PoliticalParty',
        required: false
    },
    // Optional fields with defaults for future expansion
    nic: {
        type: String,
        required: false,
        default: ''
    },
    profilePhoto: {
        type: String,
        required: false,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;