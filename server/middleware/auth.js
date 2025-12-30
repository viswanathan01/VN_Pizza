const { ClerkExpressWithAuth, clerkClient } = require('@clerk/clerk-sdk-node');
const { User } = require('../models');

// Extract and verify Mongo user from Clerk session (with Lazy Sync)
const withMongoUser = async (req, res, next) => {
  try {
    // Check if Clerk middleware passed
    if (!req.auth || !req.auth.userId) {
        const hasToken = !!req.headers.authorization;
        console.log(`❌ Auth Failure: ${hasToken ? 'JWT Invalid' : 'No Token'} [${req.method}] ${req.originalUrl}`);
        return res.status(401).json({ 
            error: 'Unauthorized', 
            details: hasToken ? 'Session invalid' : 'Authentication required' 
        });
    }

    const clerkUserId = req.auth.userId;
    let user = await User.findOne({ clerkUserId });

    // Lazy Sync: If user missing in Mongo, fetch from Clerk and create
    if (!user) {
        console.log(`⚠️ User ${clerkUserId} missing in Mongo. Attempting Lazy Sync...`);
        try {
            const clerkUser = await clerkClient.users.getUser(clerkUserId);
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            
            // Map Clerk metadata role to Mongo role (Default to USER)
            const clerkRole = clerkUser.publicMetadata?.role?.toUpperCase();
            const role = (clerkRole === 'ADMIN') ? 'ADMIN' : 'USER';

            user = await new User({
                clerkUserId,
                email: email || `unknown-${clerkUserId}@plaza.com`,
                username: clerkUser.username || email?.split('@')[0] || 'Guest',
                fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                role: role
            }).save();
            
            console.log(`✅ Lazy Sync Successful: Created ${role} ${user._id}`);
        } catch (syncError) {
            console.error(`❌ Lazy Sync Failed for ${clerkUserId}:`, syncError.message);
            return res.status(403).json({ 
                error: 'User Synchronization Failed', 
                details: 'Could not sync user profile from Auth Provider.' 
            });
        }
    }

    req.mongoUser = user;
    console.log(`🔒 Auth Success: ${user.email} [${user.role}]`);
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ error: 'Internal Auth Error' });
  }
};

const requireAuth = [
    (req, res, next) => next(),
    ClerkExpressWithAuth({ clerkClient }), 
    withMongoUser
];

const requireAdmin = (req, res, next) => {
  if (req.mongoUser?.role !== 'ADMIN') {
    console.warn(`⛔ Admin Access Denied: ${req.mongoUser.email}`);
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
