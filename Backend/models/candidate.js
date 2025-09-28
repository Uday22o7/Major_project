const mongoose = require('mongoose');
const User = require('../models/user')

const candidateSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PoliticalParty', // Reference to PoliticalParty
        required: true // Optional if independent candidates are allowed
    },
    skills: {
        type: [String],
        required: false, // Made optional for simplified form
        default: []
    },
    objectives: {
        type: [String],
        required: false, // Made optional for simplified form
        default: []
    },
    bio: {
        type: String,
        required: false, // Made optional for simplified form
        default: ''
    },
    /* votes: [{
        voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' }
    }], */
    isVerified: {
        type: Boolean,
        default: true // Admin-created candidates are auto-verified
    },
    isApproved: {
        type: Boolean,
        default: false // Candidates need admin approval to run for elections
    },
})

exports.Candidate = mongoose.model('Candidate', candidateSchema);
exports.candidateSchema = candidateSchema;