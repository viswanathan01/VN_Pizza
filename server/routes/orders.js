const express = require('express');
const router = express.Router();
const { Order, InventoryItem } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Helper: Deduct Stock
const updateInventoryStock = async (items) => {
    for (const item of items) {
        // Find base, sauce, cheese
        await InventoryItem.findOneAndUpdate({ name: item.base }, { $inc: { quantity: -1 } });
        await InventoryItem.findOneAndUpdate({ name: item.sauce }, { $inc: { quantity: -10 } }); // mL
        await InventoryItem.findOneAndUpdate({ name: item.cheese }, { $inc: { quantity: -50 } }); // grams
        for (const veg of item.veggies) {
             await InventoryItem.findOneAndUpdate({ name: veg }, { $inc: { quantity: -20 } });
        }
    }
};

// POST /api/orders - Create Order
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, totalPrice, paymentId } = req.body;
    
    const newOrder = new Order({
      userId: req.mongoUser.clerkUserId,
      items,
      totalPrice,
      paymentId,
      status: 'ORDER_RECEIVED'
    });

    await newOrder.save();
    await updateInventoryStock(items);
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ error: 'Order creation failed', details: error.message });
  }
});

// GET /api/orders/my - User History
router.get('/my', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.mongoUser.clerkUserId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/admin/all - Admin Management
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// PATCH /api/orders/admin/:id/status
router.patch('/admin/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Status update failed' });
  }
});

module.exports = router;
