require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Webhooks MUST be mounted before express.json()
const clerkWebhook = require('./routes/clerkWebhook');
app.use('/api/webhooks', clerkWebhook);

// 2. Global Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || '*' })); 
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// Database & Bootstrap
const { bootstrapInventory } = require('./utils/bootstrap');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
      console.log('✅ MongoDB Connected');
      await bootstrapInventory();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes); // Cleaned user routes
app.use('/api/analytics', analyticsRoutes);

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

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
