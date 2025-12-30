const express = require('express');
const router = express.Router();
const { Order, Ingredient, InventoryLedger } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Helper: Deduct Stock with Ledger Entry (Optimized to avoid waterfall)
const updateInventoryStock = async (items, orderId) => {
    try {
        // 1. Collect all unique ingredient names from all items
        const allNames = new Set();
        items.forEach(item => {
            if (item.snapshot) {
                const s = item.snapshot;
                [s.base, s.sauce, ...(s.cheeses || []), ...(s.toppings || [])]
                    .filter(Boolean)
                    .forEach(name => {
                        const n = typeof name === 'object' ? name.name : name;
                        if (n) allNames.add(n);
                    });
            }
        });

        if (allNames.size === 0) return;

        // 2. Bulk fetch all relevant ingredients
        const ingredients = await Ingredient.find({ name: { $in: Array.from(allNames) } }).lean();
        const ingredientMap = new Map(ingredients.map(i => [i.name, i]));

        // 3. Prepare bulk operations or iterate efficiently
        // Since we need to log ledger entries per item/ingredient, we still iterate, 
        // but now the DB lookup for ingredient is O(1) from local map.
        
        const operations = [];
        const ledgerEntries = [];

        for (const item of items) {
            if (item.snapshot) {
                const s = item.snapshot;
                const ingredientNames = [s.base, s.sauce, ...(s.cheeses || []), ...(s.toppings || [])].filter(Boolean);

                for (const ingredientName of ingredientNames) {
                    const name = typeof ingredientName === 'object' ? ingredientName.name : ingredientName;
                    const ingredient = ingredientMap.get(name);
                    
                    if (ingredient) {
                        const usage = ingredient.defaultQuantity || 1;
                        const deduction = usage * (item.quantity || 1);
                        
                        operations.push({
                            updateOne: {
                                filter: { _id: ingredient._id },
                                update: { $inc: { 'inventory.currentStock': -deduction } }
                            }
                        });

                        ledgerEntries.push({
                            ingredientId: ingredient._id,
                            action: 'REMOVE',
                            quantity: deduction,
                            unit: ingredient.unitType,
                            source: 'ORDER',
                            referenceId: orderId,
                            timestamp: new Date()
                        });
                    }
                }
            }
        }

        if (operations.length > 0) {
            await Ingredient.bulkWrite(operations);
            await InventoryLedger.insertMany(ledgerEntries);
        }
    } catch (err) {
        console.error('🔥 Critical Ledger Sync Error:', err);
    }
};

// POST /api/orders - Create Order
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId || !req.mongoUser) return res.status(401).json({ error: 'Unauthorized' });

    const { items, totalPrice, paymentId, contactNumber } = req.body;
    
    const newOrder = new Order({
      userId: req.mongoUser.clerkUserId,
      items,
      totalPrice,
      paymentId: paymentId || 'COD',
      contactNumber,
      status: 'ORDER_RECEIVED'
    });

    await newOrder.save();
    
    // Non-blocking stock update
    updateInventoryStock(items, newOrder._id).catch(err => console.error('Ledger Error:', err));
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order Error:', error);
    res.status(400).json({ error: 'Order creation failed', details: error.message });
  }
});

// GET /api/orders/my - User History
router.get('/my', requireAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId || !req.mongoUser) return res.status(401).json({ error: 'Unauthorized' });
    
    const orders = await Order.find({ userId: req.mongoUser.clerkUserId })
        .sort({ createdAt: -1 })
        .lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/admin/all - Admin Management
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// PATCH /api/orders/admin/:id/status
router.patch('/admin/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Status update failed' });
  }
});

module.exports = router;
