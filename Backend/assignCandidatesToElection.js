const mongoose = require('mongoose');
const { Election } = require('./models/election');
const { Candidate } = require('./models/candidate');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/evoting', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const assignCandidatesToElection = async () => {
    try {
        console.log('🔍 Finding elections and candidates...');

        // Find all elections
        const elections = await Election.find();
        console.log(`Found ${elections.length} elections`);

        // Find all candidates
        const candidates = await Candidate.find();
        console.log(`Found ${candidates.length} candidates`);

        if (elections.length === 0) {
            console.log('❌ No elections found. Please create elections first.');
            return;
        }

        if (candidates.length === 0) {
            console.log('❌ No candidates found. Please create candidates first.');
            return;
        }

        // Assign candidates to the first election (for testing)
        const election = elections[0];
        console.log(`\n🎯 Assigning candidates to election: ${election.name}`);

        // Clear existing candidates
        election.candidates = [];

        // Add all candidates to this election
        for (const candidate of candidates) {
            if (!election.candidates.includes(candidate._id)) {
                election.candidates.push(candidate._id);
                console.log(`✅ Added candidate: ${candidate.user?.firstName || 'Unknown'}`);
            }
        }

        // Save the election
        await election.save();
        console.log(`\n🎉 Successfully assigned ${election.candidates.length} candidates to election: ${election.name}`);

        // Display the updated election
        const updatedElection = await Election.findById(election._id).populate({
            path: 'candidates',
            populate: {
                path: 'user',
                model: 'User',
                select: 'firstName lastName email'
            }
        });

        console.log('\n📋 Updated Election Details:');
        console.log(`Name: ${updatedElection.name}`);
        console.log(`Date: ${updatedElection.date}`);
        console.log(`Candidates: ${updatedElection.candidates.length}`);

        if (updatedElection.candidates.length > 0) {
            console.log('\n👥 Candidates in this election:');
            updatedElection.candidates.forEach((candidate, index) => {
                console.log(`${index + 1}. ${candidate.user?.firstName} ${candidate.user?.lastName} (${candidate.user?.email})`);
            });
        }

    } catch (error) {
        console.error('❌ Error assigning candidates:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed.');
    }
};

// Run the script
assignCandidatesToElection();
