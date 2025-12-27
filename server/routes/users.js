const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { requireAuth } = require('../middleware/auth');

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
