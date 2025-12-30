const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { clerkClient } = require('@clerk/clerk-sdk-node');

// GET /api/admin/users
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password') // Although password isn't stored, good practice
            .sort({ createdAt: -1 })
            .lean();
        res.json(users);
    } catch (err) {
        console.error('Fetch Users Error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['USER', 'CHEF', 'DELIVERY', 'ADMIN'];
        
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Prevent Self-Demotion
        if (targetUser._id.toString() === req.mongoUser._id.toString() && role !== 'ADMIN') {
            return res.status(403).json({ error: 'You cannot remove your own Admin privileges.' });
        }

        // Update Mongo
        targetUser.role = role;
        await targetUser.save();

        // Sync Clerk Metadata (Best Effort)
        try {
            await clerkClient.users.updateUserMetadata(targetUser.clerkUserId, {
                publicMetadata: { role: role }
            });
        } catch (clerkErr) {
            console.error('Clerk Sync Warning:', clerkErr.message);
            // Don't fail the request if Clerk sync fails, DB is source of truth
        }

        res.json({ message: 'Role updated successfully', user: targetUser });

    } catch (err) {
        console.error('Update Role Error:', err);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

module.exports = router;
