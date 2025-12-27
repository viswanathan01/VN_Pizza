const express = require('express');
const { Webhook } = require('svix');
const { User } = require('../models');
const { clerkClient } = require('@clerk/clerk-sdk-node');

const router = express.Router();

// POST /api/webhooks/clerk
router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET is not set in .env');
    return res.status(500).json({ error: 'Webhook secret missing' });
  }

  // Get SVIX headers
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  // Validate headers
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  let evt;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(req.body.toString(), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('❌ Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { type, data } = evt;
  console.log(`🔔 Webhook received: ${type}`);

  try {
    // ---- USER CREATED / UPDATED ----
    if (type === 'user.created' || type === 'user.updated') {
        
      // 🛡️ GUARD: Fail loudly if ID is missing
      if (!data?.id) {
          throw new Error("❌ Missing Clerk user id in webhook payload");
      }

      const clerkUserId = data.id;
      // Capture ALL emails associated with the user
      const userEmails = data.email_addresses?.map(e => e.email_address) || [];
      const email = userEmails[0]; 
      
      const username = data.username;
      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
      
      // 🔒 SECURITY: Deterministic Role Assignment
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);
        
      // Check if ANY of the user's emails match an admin email
      const isAdmin = userEmails.some(uEmail => adminEmails.includes(uEmail.toLowerCase()));
      const role = isAdmin ? 'ADMIN' : 'USER';

      // 1. Sync to MongoDB (Authoritative DB)
      // FIX: Matches strict prompt requirements
      await User.findOneAndUpdate(
        { clerkUserId },
        {
          clerkUserId,
          email,
          username,
          fullName,
          role, 
        },
        { upsert: true, new: true }
      );

      // 2. Sync BACK to Clerk (Frontend Cache)
      try {
        await clerkClient.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            role: role
          }
        });
        console.log(`🔄 Clerk Metadata Updated: ${role}`);
      } catch (clerkErr) {
        console.error('⚠️ Failed to update Clerk Metadata:', clerkErr.message);
      }

      console.log(`✅ User synced to MongoDB: ${username || email} -> Role: ${role}`);
    }

    // ---- USER DELETED ----
    if (type === 'user.deleted') {
      await User.findOneAndDelete({ clerkUserId: data.id });
      console.log(`🗑️ User deleted from MongoDB: ${data.id}`);
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Error processing webhook:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
