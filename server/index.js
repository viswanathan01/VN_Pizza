require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Config Check
console.log(`📦 System: MongoDB=${!!process.env.MONGO_URI}, ClerkKey=${!!process.env.CLERK_SECRET_KEY || !!process.env.CLERK_API_KEY}`);

// 1. Webhooks MUST be mounted before express.json()
const clerkWebhook = require('./routes/clerkWebhook');
app.use('/api/webhooks', clerkWebhook);

// 2. Global Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || '*' })); 
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// Routes
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('🍕 Plaza Pizza API is running.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
      error: 'Internal Server Error', 
      message: err.message 
  });
});

// Database Connection
// Options to improve connectivity stability on varying networks/IPs
const MONGO_OPTIONS = {
    serverSelectionTimeoutMS: 5000, // Timeout faster if IP is blocked
    family: 4 // Force IPv4 to avoid Node v17+ DNS issues
};

console.log('🔄 Connecting to Database...');

mongoose.connect(process.env.MONGO_URI, MONGO_OPTIONS)
  .then(async () => {
      console.log('✅ MongoDB Connected');
      
      // Start Server ONLY after DB Connection
      app.listen(PORT, async () => {
          console.log(`🚀 Server running on port ${PORT}`);
      });
  })
  .catch(err => {
      console.error('❌ CRITICAL DATABASE ERROR ❌');
      console.error('---------------------------------------------------');
      console.error('Could not connect to MongoDB Atlas.');
      console.error('POSSIBLE CAUSES:');
      console.error('1. IP Address Blocked: You must Whitelist your current IP in Atlas.');
      console.error('2. Internet Connectivity Issues.');
      console.error('3. Invalid MONGO_URI.');
      console.error('---------------------------------------------------');
      console.error('Error Details:', err.message);
      process.exit(1); // Exit process so prompt or auto-restart can retry
  });
