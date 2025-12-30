const express = require('express');
const router = express.Router();
const { Order, Ingredient, InventoryLedger } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper: Deduct Stock with Ledger Entry (Strict Validation)
const updateInventoryStock = async (items, orderId) => {
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

    // 2. Fetch Ingredients to check stock
    const ingredients = await Ingredient.find({ name: { $in: Array.from(allNames) } });
    const ingredientMap = new Map(ingredients.map(i => [i.name, i]));

    // 3. Pre-Validation Check
    const deductions = new Map(); // IngredientID -> TotalDeduction

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
                    const currentTotal = deductions.get(ingredient._id.toString()) || 0;
                    deductions.set(ingredient._id.toString(), currentTotal + deduction);
                }
            }
        }
    }

    // Check availability
    for (const [id, totalNeeded] of deductions.entries()) {
        const ingredient = ingredients.find(i => i._id.toString() === id);
        if (!ingredient || ingredient.inventory.currentStock < totalNeeded) {
            throw new Error(`Insufficient stock for ${ingredient?.name}. Required: ${totalNeeded}, Available: ${ingredient?.inventory?.currentStock}`);
        }
    }

    // 4. Execute Deductions
    const operations = [];
    const ledgerEntries = [];

    for (const [id, totalNeeded] of deductions.entries()) {
        const ingredient = ingredients.find(i => i._id.toString() === id);
        
        operations.push({
            updateOne: {
                filter: { _id: id },
                update: { $inc: { 'inventory.currentStock': -totalNeeded } }
            }
        });

        ledgerEntries.push({
            ingredientId: id,
            action: 'REMOVE',
            quantity: totalNeeded,
            unit: ingredient.unitType,
            source: 'ORDER',
            referenceId: orderId,
            timestamp: new Date()
        });
    }

    if (operations.length > 0) {
        await Ingredient.bulkWrite(operations);
        await InventoryLedger.insertMany(ledgerEntries);
    }
};

// Helper: FSM Validation
const validateStatusTransition = (currentStatus, newStatus, role) => {
    const rules = {
        'ORDER_RECEIVED': { next: 'IN_KITCHEN', roles: ['CHEF', 'ADMIN'] },
        'IN_KITCHEN': { next: 'OUT_FOR_DELIVERY', roles: ['CHEF', 'ADMIN'] },
        'OUT_FOR_DELIVERY': { next: 'DELIVERED', roles: ['DELIVERY', 'ADMIN'] },
        'DELIVERED': { next: null, roles: [] },
        'PAYMENT_FAILED': { next: null, roles: [] }
    };

    const rule = rules[currentStatus];
    if (!rule) return { valid: false, error: 'Invalid current status' };
    
    // Strict next state check
    if (rule.next !== newStatus && role !== 'ADMIN') return { valid: false, error: `Invalid transition from ${currentStatus} to ${newStatus}` };
    
    // Role check
    if (!rule.roles.includes(role)) return { valid: false, error: `Role ${role} unauthorized for this action` };

    return { valid: true };
};

// POST /api/orders - Create Order
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId || !req.mongoUser) return res.status(401).json({ error: 'Unauthorized' });

    const { items, totalPrice, paymentId, customer, deliveryAddress } = req.body;
    
    // Validation
    if (!customer || !deliveryAddress) {
        return res.status(400).json({ error: 'Customer details and delivery address required' });
    }

    // STRICT INVENTORY CHECK (Blocking)
    try {
        // We pass a dummy ID for now just to validate stock, actual deduction happens after valid save? 
        // No, "NO ORDER may succeed without inventory mutation". So we must deduct.
        // But if save fails? MongoDB transactions are ideal but complex setup.
        // We will stick to the prompt: "If inventory is insufficient → reject order"
        
        // We assume we want to deduct *before* or *during* save. 
        // Since we don't have transactions setup guaranteed, strict check first.
        
        // To strictly ensure ID exists for ledger, we generate ID first.
        const newOrderId = new mongoose.Types.ObjectId();
        
        await updateInventoryStock(items, newOrderId); // This will THROW if insufficient

        const newOrder = new Order({
            _id: newOrderId,
            userId: req.mongoUser.clerkUserId,
            items,
            totalPrice,
            paymentId: paymentId || 'COD',
            customer,
            deliveryAddress,
            status: 'ORDER_RECEIVED',
            updatedByRole: 'USER'
        });

        await newOrder.save();
        
        // Auto-update User Profile
        await req.mongoUser.updateOne({
            $set: {
                contactNumber: customer.contactNumber,
                savedAddress: deliveryAddress
            }
        });

        res.status(201).json(newOrder);

    } catch (stockError) {
        console.error("Inventory Block:", stockError.message);
        return res.status(400).json({ error: 'Inventory Shortage', details: stockError.message });
    }

  } catch (error) {
    console.error('Order Error:', error);
    res.status(400).json({ error: 'Order creation failed', details: error.message });
  }
});

// GET /api/orders/my - User History
router.get('/my', requireAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const orders = await Order.find({ userId: req.mongoUser.clerkUserId })
        .sort({ createdAt: -1 })
        .lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/kitchen - Chef View (ORDER_RECEIVED, IN_KITCHEN)
router.get('/kitchen', requireAuth, async (req, res) => {
    try {
        if (!['CHEF', 'ADMIN'].includes(req.mongoUser.role)) return res.status(403).json({ error: 'Kitchen Access Only' });
        
        const orders = await Order.find({
            status: { $in: ['ORDER_RECEIVED', 'IN_KITCHEN'] }
        }).sort({ createdAt: 1 }); // Oldest first for kitchen
        
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: 'Kitchen Sync Failed' });
    }
});

// GET /api/orders/delivery - Delivery View (OUT_FOR_DELIVERY)
router.get('/delivery', requireAuth, async (req, res) => {
    try {
        if (!['DELIVERY', 'ADMIN'].includes(req.mongoUser.role)) return res.status(403).json({ error: 'Delivery Access Only' });
        
        const orders = await Order.find({
            status: 'OUT_FOR_DELIVERY'
        }).sort({ createdAt: 1 });
        
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: 'Delivery Sync Failed' });
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

// PATCH /api/orders/:id/status - FSM Transition
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    if (!newStatus) return res.status(400).json({ error: 'New status is required' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const role = req.mongoUser.role.toUpperCase(); // Ensure uppercase for FSM Check

    // Validate Transition
    const check = validateStatusTransition(order.status, newStatus, role);
    if (!check.valid) {
        return res.status(403).json({ error: check.error });
    }

    // Apply Update (Direct DB Write to bypass full doc validation issues)
    await Order.updateOne(
        { _id: order._id },
        { 
            $set: { 
                status: newStatus, 
                updatedByRole: role,
                updatedAt: new Date()
            } 
        }
    );

    // Return updated order state for UI
    const updatedOrder = { ...order.toObject(), status: newStatus, updatedByRole: role };
    res.json(updatedOrder);

  } catch (error) {
    console.error("Status Update Failed:", error);
    res.status(400).json({ error: error.message || 'Status update failed' });
  }
});

module.exports = router;
