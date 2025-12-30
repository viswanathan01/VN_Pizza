const express = require('express');
const router = express.Router();
const { Order, Ingredient, InventoryLedger } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper: Deduct Stock with Ledger Entry (Strict Validation)
const updateInventoryStock = async (items, orderId) => {
    const { StockBatch } = require('../models');
    
    // 1. Collect all unique ingredient names and their total required quantities
    const requirements = new Map(); // name -> totalQuantity

    items.forEach(item => {
        if (item.snapshot) {
            const s = item.snapshot;
            const ingredientNames = [s.base, s.sauce, ...(s.cheeses || []), ...(s.toppings || [])].filter(Boolean);
            
            for (const ingredientName of ingredientNames) {
                const name = typeof ingredientName === 'object' ? ingredientName.name : ingredientName;
                if (!name) continue;
                
                const usage = 1; // Default usage per unit? 
                // Let's look at how it was before: usage = ingredient.defaultQuantity || 1;
                // I need to fetch ingredients first to get defaultQuantity.
                requirements.set(name, (requirements.get(name) || 0) + (item.quantity || 1));
            }
        }
    });

    if (requirements.size === 0) return;

    // 2. Fetch Ingredients and calculate total deduction needed in base units
    const ingredients = await Ingredient.find({ name: { $in: Array.from(requirements.keys()) } });
    const ingredientMap = new Map(ingredients.map(i => [i.name, i]));
    
    // Recalculate requirements in base units
    const finalRequirements = new Map(); // ingredientId -> totalDeductionQuantity
    for (const [name, qty] of requirements) {
        const ingredient = ingredientMap.get(name);
        if (ingredient) {
            const deduction = (ingredient.defaultQuantity || 1) * qty;
            finalRequirements.set(ingredient._id.toString(), (finalRequirements.get(ingredient._id.toString()) || 0) + deduction);
        }
    }

    // 3. Pre-Validation: Check if total stock is sufficient BEFORE any mutation
    for (const [id, needed] of finalRequirements) {
        const ingredient = ingredients.find(i => i._id.toString() === id);
        if (!ingredient || ingredient.inventory.currentStock < needed) {
            throw new Error(`Insufficient stock for ${ingredient?.name || id}. Required: ${needed}, Available: ${ingredient?.inventory?.currentStock || 0}`);
        }
    }

    // 4. Execute FIFO Deduction from Batches
    const batchOperations = [];
    const ingredientOperations = [];
    const ledgerEntries = [];

    for (const [ingId, totalNeeded] of finalRequirements) {
        const ingredient = ingredients.find(i => i._id.toString() === ingId);
        let remainingToDeduct = totalNeeded;

        // Find matches batches, sorted by receivedAt (FIFO)
        const batches = await StockBatch.find({ ingredientId: ingId, quantity: { $gt: 0 } }).sort({ receivedAt: 1 });

        for (const batch of batches) {
            if (remainingToDeduct <= 0) break;

            const deductionFromBatch = Math.min(batch.quantity, remainingToDeduct);
            
            batchOperations.push({
                updateOne: {
                    filter: { _id: batch._id },
                    update: { $inc: { quantity: -deductionFromBatch } }
                }
            });

            remainingToDeduct -= deductionFromBatch;
        }

        // If after checking all batches we still need more (shouldn't happen due to pre-validation but just in case)
        if (remainingToDeduct > 0) {
            // This might happen if 'Ingredient.currentStock' is out of sync with 'sum(Batches)'.
            // In a production system, we might want to log this critical inconsistency.
            // For now, we deduct the rest from the ingredient anyway to keep Ingredient.stock authoritative.
        }

        ingredientOperations.push({
            updateOne: {
                filter: { _id: ingId },
                update: { $inc: { 'inventory.currentStock': -totalNeeded } }
            }
        });

        ledgerEntries.push({
            ingredientId: ingId,
            action: 'REMOVE',
            quantity: totalNeeded,
            unit: ingredient.unitType,
            source: 'ORDER',
            referenceId: orderId,
            timestamp: new Date()
        });
    }

    // 5. Atomic-ish execution (BulkWrite)
    if (batchOperations.length > 0) await StockBatch.bulkWrite(batchOperations);
    if (ingredientOperations.length > 0) await Ingredient.bulkWrite(ingredientOperations);
    if (ledgerEntries.length > 0) await InventoryLedger.insertMany(ledgerEntries);
};

// Helper: Reverse Stock (for Cancelled/Failed orders)
const reverseInventoryStock = async (items, orderId) => {
    const { StockBatch } = require('../models');
    const requirements = new Map();

    items.forEach(item => {
        if (item.snapshot) {
            const s = item.snapshot;
            const ingredientNames = [s.base, s.sauce, ...(s.cheeses || []), ...(s.toppings || [])].filter(Boolean);
            for (const nameObj of ingredientNames) {
                const name = typeof nameObj === 'object' ? nameObj.name : nameObj;
                if (name) requirements.set(name, (requirements.get(name) || 0) + (item.quantity || 1));
            }
        }
    });

    if (requirements.size === 0) return;

    const ingredients = await Ingredient.find({ name: { $in: Array.from(requirements.keys()) } });
    
    for (const [name, qty] of requirements) {
        const ingredient = ingredients.find(i => i.name === name);
        if (!ingredient) continue;

        const amountToRestore = (ingredient.defaultQuantity || 1) * qty;

        // Restore to Batches: We'll put it back into the LATEST active batch of this ingredient
        // or create a reversal batch. Creating a reversal batch is cleaner for audit.
        await new StockBatch({
            ingredientId: ingredient._id,
            batchId: `REV-${orderId.toString().slice(-6)}`,
            quantity: amountToRestore,
            unit: ingredient.unitType,
            costPerUnit: ingredient.pricePerUnit,
            receivedAt: new Date()
        }).save();

        // Update Ingredient
        ingredient.inventory.currentStock += amountToRestore;
        await ingredient.save();

        // Ledger
        await new InventoryLedger({
            ingredientId: ingredient._id,
            action: 'ADD',
            quantity: amountToRestore,
            unit: ingredient.unitType,
            source: 'SYSTEM',
            referenceId: orderId,
            supplierName: 'Order Reversal'
        }).save();
    }
};

// Helper: FSM Validation
const validateStatusTransition = (currentStatus, newStatus, role) => {
    const rules = {
        'ORDER_RECEIVED': { next: ['IN_KITCHEN', 'CANCELLED', 'PAYMENT_FAILED'], roles: ['CHEF', 'ADMIN'] },
        'IN_KITCHEN': { next: ['OUT_FOR_DELIVERY', 'CANCELLED'], roles: ['CHEF', 'ADMIN'] },
        'OUT_FOR_DELIVERY': { next: ['DELIVERED', 'CANCELLED'], roles: ['DELIVERY', 'ADMIN'] },
        'DELIVERED': { next: [], roles: [] },
        'PAYMENT_FAILED': { next: [], roles: [] },
        'CANCELLED': { next: [], roles: [] }
    };

    const rule = rules[currentStatus];
    if (!rule) return { valid: false, error: 'Invalid current status' };
    
    // Strict next state check
    if (!rule.next.includes(newStatus) && role !== 'ADMIN') {
        // Special case: Allow user to cancel if still in ORDER_RECEIVED? 
        // For now, prompt specifies Chef/Delivery/Admin roles mostly.
        return { valid: false, error: `Invalid transition from ${currentStatus} to ${newStatus}` };
    }
    
    // Role check
    if (role !== 'ADMIN' && !rule.roles.includes(role)) {
        return { valid: false, error: `Role ${role} unauthorized for this action` };
    }

    return { valid: true };
};

// POST /api/orders - Create Order
router.post('/', requireAuth, async (req, res) => {
  const newOrderId = new mongoose.Types.ObjectId();
  const { items, totalPrice, paymentId, customer, deliveryAddress } = req.body;

  try {
    const userId = req.auth?.userId;
    if (!userId || !req.mongoUser) return res.status(401).json({ error: 'Unauthorized' });

    if (!customer || !deliveryAddress) {
        return res.status(400).json({ error: 'Customer details and delivery address required' });
    }

    // 1. Deduct Stock
    await updateInventoryStock(items, newOrderId);

    // 2. Save Order
    try {
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
    } catch (saveError) {
        // ROLLBACK Inventory if Order save fails
        await reverseInventoryStock(items, newOrderId);
        throw saveError;
    }

  } catch (error) {
    console.error('Order Error:', error);
    res.status(400).json({ error: error.message || 'Order creation failed' });
  }
});

// GET /api/orders/my - User History
router.get('/my', requireAuth, async (req, res) => {
  try {
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

    const role = (req.mongoUser?.role || 'USER').toUpperCase();

    // Validate Transition
    const check = validateStatusTransition(order.status, newStatus, role);
    if (!check.valid) {
        return res.status(403).json({ error: check.error });
    }

    // Special Logic: If going to CANCELLED or PAYMENT_FAILED, reverse stock
    if (['CANCELLED', 'PAYMENT_FAILED'].includes(newStatus) && !['CANCELLED', 'PAYMENT_FAILED'].includes(order.status)) {
        await reverseInventoryStock(order.items, order._id);
    }

    // Apply Update
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

    res.json({ ...order.toObject(), status: newStatus, updatedByRole: role });

  } catch (error) {
    console.error("Status Update Failed:", error);
    res.status(400).json({ error: error.message || 'Status update failed' });
  }
});

module.exports = router;
