const mongoose = require('mongoose');

const electionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    where: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    rules: {
        type: String
    },
    candidates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
    }],
    parties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PoliticalParty' // Reference to PoliticalParty
    }],
    results: {
        type: new mongoose.Schema({
            totalVotes: { type: Number, default: 0 },
            winningCandidate: {
                candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
                name: { type: String }
            },
            winningParty: {
                partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliticalParty' },
                name: { type: String }
            },
            voteDistribution: [{
                candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
                votes: { type: Number, default: 0 },
                voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
            }]
        }, { _id: false }),
        default: () => ({ totalVotes: 0, winningCandidate: {}, winningParty: {}, voteDistribution: [] })
    },
    isCompleted: {
        type: Boolean,
        default: false // Indicates whether the election has concluded
    }
});

exports.Election = mongoose.model('Election', electionSchema);
exports.electionSchema = electionSchema;
