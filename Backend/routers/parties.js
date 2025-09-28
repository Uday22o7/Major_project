const express = require('express');
const router = express.Router();
const { PoliticalParty } = require('../models/party');

// Get all parties
router.get('/', async (req, res) => {
    try {
        const parties = await PoliticalParty.find();
        res.status(200).json({ success: true, parties });
    } catch (error) {
        console.error('Error fetching parties:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get count of parties
router.get('/get/count', async (req, res) => {
    try {
        const count = await PoliticalParty.countDocuments();
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Error fetching party count:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all names of parties
router.get('/party', async (req, res) => {
    try {
        const parties = await PoliticalParty.find();
        res.status(200).json({ success: true, data: parties });
    } catch (error) {
        console.error('Error fetching parties:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get party by ID
router.get('/:id', async (req, res) => {
    try {
        const party = await PoliticalParty.findById(req.params.id);
        if (!party) {
            return res.status(404).json({ success: false, message: 'Party not found' });
        }
        res.status(200).json({ success: true, party });
    } catch (error) {
        console.error('Error fetching party:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Create a new party
router.post('/', async (req, res) => {
    try {
        const { name, abbreviation, headquarter } = req.body;

        // Check for missing fields
        if (!name || !abbreviation || !headquarter) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields: name, abbreviation, and headquarter' });
        }

        const newParty = new PoliticalParty({
            name,
            abbreviation,
            headquarter
        });

        await newParty.save();
        res.status(201).json({ success: true, message: 'Political Party created successfully', party: newParty });
    } catch (error) {
        console.error('Error creating party:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update a party
router.put('/:id', async (req, res) => {
    try {
        const { name, abbreviation, headquarter } = req.body;

        const updatedFields = {
            name,
            abbreviation,
            headquarter
        };

        const updatedParty = await PoliticalParty.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedParty) {
            return res.status(404).json({ success: false, message: 'Party not found' });
        }

        res.status(200).json({ success: true, message: 'Political Party updated successfully', party: updatedParty });
    } catch (error) {
        console.error('Error updating party:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete a party
router.delete('/:id', async (req, res) => {
    try {
        const deletedParty = await PoliticalParty.findByIdAndDelete(req.params.id);

        if (!deletedParty) {
            return res.status(404).json({ success: false, message: 'Party not found' });
        }

        res.status(200).json({ success: true, message: 'Political Party deleted successfully' });
    } catch (error) {
        console.error('Error deleting party:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
