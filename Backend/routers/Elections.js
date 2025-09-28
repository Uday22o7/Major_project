const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Election } = require('../models/election');
const { User } = require('../models/user');
const Service = require('../Services/GenericService');
const { Candidate } = require('../models/candidate');
const name = 'Election';

// Helper function to create a full Date object from date and time
const createFullDate = (date, time) => {
    const [hours, minutes] = time.split(':');
    const fullDate = new Date(date); // Start with the provided date
    fullDate.setHours(hours, minutes, 0, 0); // Set the time part to the provided hours and minutes
    return fullDate;
};


// Get Elections
router.get('/', async (req, res) => {
    Service.getAll(res, Election, name).catch((error) => {
        res.status(500).send(error + " Server Error");
    });
});

// Get Election By id
router.get('/:id', async (req, res) => {
    Service.getById(req, res, Election, name).catch((error) => {
        res.status(500).send(error + " Server Error");
    });
});

// Delete an Election
router.delete('/:id', (req, res) => {
    Service.deleteById(req, res, Election, name).catch((error) => {
        res.status(500).send(error + " Server Error");
    });
});

// Get Count
router.get('/get/count', (req, res) => {
    Service.getCount(res, Election, name).catch((error) => {
        res.status(500).send(error + " Server Error");
    });
});

// Get count of active elections
router.get('/get/active/count', async (req, res) => {
    try {
        const now = new Date();
        const count = await Election.countDocuments({
            startTime: { $lte: now },
            endTime: { $gte: now }
        });
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Error fetching active elections count:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get count of closed elections
router.get('/get/closed/count', async (req, res) => {
    try {
        const now = new Date();
        const count = await Election.countDocuments({
            endTime: { $lt: now }
        });
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Error fetching closed elections count:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Add new Election
router.post('/', async (req, res) => {
    const { name, where, date, startTime, endTime, description, rules } = req.body;

    // Validate required fields
    if (!name || !where || !date || !startTime || !endTime || !description) {
        return res.status(400).json({ success: false, message: "Please fill all the required fields!" });
    }

    try {
        // Parse the date and time fields
        const electionDate = new Date(date);  // Date when the election happens
        const electionStartTime = new Date(startTime);  // Start time of the election
        const electionEndTime = new Date(endTime);  // End time of the election

        // Set the year, month, and date of start and end times according to the election date
        electionStartTime.setFullYear(electionDate.getFullYear(), electionDate.getMonth(), electionDate.getDate());
        electionEndTime.setFullYear(electionDate.getFullYear(), electionDate.getMonth(), electionDate.getDate());

        // Create a new election object
        let election = new Election({
            name,
            where,
            date: electionDate,
            startTime: electionStartTime,
            endTime: electionEndTime,
            description,
            rules
        });

        // Save the election to the database
        election = await election.save();

        if (!election) {
            return res.status(400).json({ success: false, message: "Election could not be added!" });
        }

        // Return success response
        res.status(201).json({ success: true, message: "Successfully added", data: election });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
});


// Update an Election by ID
router.put('/:id', async (req, res) => {
    const electionId = req.params.id;
    const { name, where, date, description, rules, startTime, endTime } = req.body;

    try {
        // Find the election by ID and update it
        const election = await Election.findByIdAndUpdate(
            electionId,
            {
                name,
                where,
                date,
                description,
                rules,
                startTime,
                endTime
            },
            { new: true } // Return the updated document
        );

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        res.status(200).json({
            message: 'Election updated successfully',
            election,
        });
    } catch (error) {
        console.error('Error updating election:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});




// Get Election By id (with candidates details)
router.get('/election/:id', async (req, res) => {
    try {
        const election = await Election.findById(req.params.id).populate({
            path: 'candidates',
            populate: {
                path: 'user',
                model: 'User'
            }
        });

        if (!election) {
            return res.status(404).json({ success: false, message: "Election not found" });
        }

        res.status(200).json({ success: true, data: election });
    } catch (error) {
        res.status(500).send(error + " Server Error");
    }
});

// Get candidates for a specific election
router.get('/:id/candidates', async (req, res) => {
    try {
        const election = await Election.findById(req.params.id).populate({
            path: 'candidates',
            match: { isApproved: true }, // Only return approved candidates
            populate: {
                path: 'user',
                model: 'User',
                select: 'firstName lastName email phone profilePhoto'
            }
        });

        if (!election) {
            return res.status(404).json({ success: false, message: "Election not found" });
        }

        // Filter out null candidates (those that didn't match the isApproved condition)
        const approvedCandidates = election.candidates.filter(candidate => candidate !== null);

        res.status(200).json({
            success: true,
            data: approvedCandidates,
            message: "Approved candidates fetched successfully"
        });
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Apply for Election
router.post('/:id/apply', async (req, res) => {
    try {
        const userId = req.body.userId;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Ensure the user is a candidate
        if (!user.isCandidate) {
            return res.status(403).json({ success: false, message: 'You cannot apply because you are not a candidate' });
        }

        // Check if the election exists
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        // Validate if the election has already ended
        const currentDateTime = new Date();
        const electionEndTime = new Date(election.endTime); // Ensure endTime is stored correctly in DB

        if (currentDateTime > electionEndTime) {
            return res.status(400).json({ success: false, message: "Election has ended. You can't apply." });
        }

        // 7-day application deadline removed - candidates can apply anytime before election ends

        // Check if candidate exists
        const candidate = await Candidate.findOne({ user: userId });
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate details not found' });
        }

        // Add candidate to election if not already included
        if (!election.candidates.includes(candidate._id)) {
            election.candidates.push(candidate._id);
            await election.save();
        }

        res.status(200).json({ success: true, message: 'Applied successfully', candidate });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get("/results", (req, res) => {
    const results = {
        Colombo: { votes: 150000, winningParty: "Party A" },
        Kandy: { votes: 120000, winningParty: "Party B" },
        Jaffna: { votes: 80000, winningParty: "Party A" },
    };
    res.json(results);
});


// Endpoint to vote for candidate
router.post('/:electionId/vote/:candidateId', async (req, res) => {
    const { electionId } = req.params;
    const { candidateId } = req.params;
    const { voterId, blockchainTxHash } = req.body;

    // Validate IDs
    if (!mongoose.isValidObjectId(electionId) || !mongoose.isValidObjectId(candidateId) || !mongoose.isValidObjectId(voterId)) {
        return res.status(400).json({ success: false, message: 'Invalid Election ID, Voter ID or Candidate ID' });
    }

    try {
        // Fetch the election
        const election = await Election.findById(electionId).populate('candidates');
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        const voter = await User.findById(voterId);
        if (!voter) {
            return res.status(404).json({ success: false, message: 'Voter not found' });
        }

        // Ensure results object structure exists for legacy records
        if (!election.results) {
            election.results = { totalVotes: 0, winningCandidate: {}, winningParty: {}, voteDistribution: [] };
        }
        if (!Array.isArray(election.results.voteDistribution)) {
            election.results.voteDistribution = [];
        }

        // Check if the election is ongoing
        const currentDateTime = new Date();
        const electionStartTime = new Date(election.startTime);
        const electionEndTime = new Date(election.endTime);

        if (currentDateTime < electionStartTime) {
            return res.status(400).json({ success: false, message: 'Election has not started yet' });
        }

        if (currentDateTime > electionEndTime) {
            return res.status(400).json({ success: false, message: 'Election has ended' });
        }

        // Ensure the candidate belongs to this election
        const candidateExists = election.candidates.some(candidate =>
            candidate._id.toString() === candidateId);
        if (!candidateExists) {
            return res.status(404).json({ success: false, message: 'Candidate not found in this election' });
        }

        // Check if voter location matches election location
        if (voter.location.toLowerCase() !== election.where.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: `You can only vote in elections for your registered location (${voter.location}). This election is for ${election.where}.`
            });
        }

        // Check if the voter has already voted in this election
        const hasVoted = election.results.voteDistribution.some(vote =>
            Array.isArray(vote.voters) && vote.voters.some(voter => voter.toString() === voterId)
        );
        if (hasVoted) {
            return res.status(400).json({ success: false, message: 'You have already voted in this election' });
        }

        // Update the vote distribution
        let candidateVote = election.results.voteDistribution.find(vote =>
            vote.candidateId && vote.candidateId.toString() === candidateId);
        if (candidateVote) {
            if (!Array.isArray(candidateVote.voters)) candidateVote.voters = [];
            candidateVote.voters.push(voterId);
            candidateVote.votes = (candidateVote.votes || 0) + 1;
        } else {
            election.results.voteDistribution.push({
                candidateId,
                votes: 1,
                voters: [voterId]
            });
        }

        // Store blockchain transaction hash if provided
        if (blockchainTxHash) {
            if (!election.results.blockchainTransactions) {
                election.results.blockchainTransactions = [];
            }
            election.results.blockchainTransactions.push({
                voterId,
                candidateId,
                transactionHash: blockchainTxHash,
                timestamp: new Date()
            });
        }

        // Increment total votes
        election.results.totalVotes = (election.results.totalVotes || 0) + 1;

        // Save election data
        await election.save();

        res.status(200).json({ success: true, message: 'Vote successfully recorded' });
    } catch (error) {
        console.error('Voting error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
