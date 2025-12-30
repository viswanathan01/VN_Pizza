const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { requireAuth } = require('../middleware/auth');

// PATCH /api/user/me - Update profile
router.patch('/me', requireAuth, async (req, res) => {
    try {
        const { username, contactNumber, savedAddress, role } = req.body;
        
        // Prevent role hacking - only admins (or a specific strategy) can change roles via API, but here we likely only want user profile
        // For this task, we assume role is managed via seed or clerk metadata sync (which is handled elsewhere likely).
        // We will strictly allow updating profile fields.

        const updates = {};
        if (username) updates.username = username;
        if (contactNumber) updates.contactNumber = contactNumber;
        if (savedAddress) updates.savedAddress = savedAddress;

        const user = await User.findOneAndUpdate(
            { clerkUserId: req.auth.userId },
            { $set: updates },
            { new: true }
        );

        res.json(user);
    } catch(e) {
        console.error("User Update Error:", e);
        res.status(500).json({ error: 'Update Failed' });
    }
});

// GET /api/user/me - Get current user details from MongoDB
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findOne({ clerkUserId: req.auth.userId });
        if(!user) {
             // 404 is valid if sync hasn't happened yet, but Auth middleware usually catches this as 403
             return res.status(404).json({ error: 'User profile not found in database.' });
        }
        res.json(user);
    } catch(e) {
        console.error("User Fetch Error:", e);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
