const express = require('express');
const router = express.Router();
const { Order, InventoryItem } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/analytics/dashboard
router.get('/dashboard', requireAuth, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Run parallel queries for efficiency
    const [
      activeOrdersCount,
      outOfStockCount,
      revenueToday,
      totalItemsCount
    ] = await Promise.all([
      // 1. Active Orders (Not Delivered/Cancelled)
      Order.countDocuments({ 
        status: { $in: ['ORDER_RECEIVED', 'IN_KITCHEN', 'OUT_FOR_DELIVERY'] } 
      }),
      
      // 2. Out of Stock Items
      InventoryItem.countDocuments({ 
        $expr: { $lt: ["$quantity", "$threshold"] } 
      }),
      
      // 3. Revenue Today
      Order.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      
      // 4. Total Catalog Items
      InventoryItem.countDocuments({})
    ]);

    res.json({
      activeOrders: activeOrdersCount,
      outOfStock: outOfStockCount,
      revenue: revenueToday[0]?.total || 0,
      totalItems: totalItemsCount
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
