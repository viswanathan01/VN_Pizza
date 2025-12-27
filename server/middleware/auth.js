const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const { User } = require('../models');

// Extract and verify Mongo user from Clerk session
const withMongoUser = async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;
    console.log(`🔒 Auth Check: ClerkID=${clerkUserId}, Header=${!!req.headers.authorization}`);
    
    if (!clerkUserId) {
        console.log('❌ No Clerk User ID found in requset.');
        return res.status(401).json({ error: 'Unauthorized: No session' });
    }

    // Improve Query Robustness: Add timeout and lean() for performance
    const user = await User.findOne({ clerkUserId }).maxTimeMS(5000).lean();
    
    if (!user) {
        console.warn(`⚠️ Request from Clerk User ${clerkUserId} but no Mongo document found.`);
        // Don't block completely on temp failures, but for now we need the user.
        // If it's a sync latency issue, this is where it catches.
        return res.status(403).json({ error: 'Forbidden: User profile sync pending or failed.' });
    }

    req.mongoUser = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(500).json({ error: 'Database handshake failed' });
  }
};

const requireAuth = [
    (req, res, next) => {
        const auth = req.headers.authorization;
        console.log(`📡 [${req.method}] ${req.originalUrl} - Auth: ${auth ? auth.substring(0, 20) + '...' : 'NONE'}`);
        next();
    },
    ClerkExpressRequireAuth(), 
    withMongoUser
];

const requireAdmin = (req, res, next) => {
  if (req.mongoUser?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
