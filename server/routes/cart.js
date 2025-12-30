const express = require('express');
const router = express.Router();
const { Cart } = require('../models');
const { requireAuth } = require('../middleware/auth');

// Helper to calculate cart total
const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
};

// 1. Get Current Cart
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId || !req.mongoUser) return res.status(401).json({ error: 'Unauthorized' });
        
        let cart = await Cart.findOne({ userId: req.mongoUser.clerkUserId }).lean();
        if (!cart) {
            return res.json({ items: [], totalAmount: 0 });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// 2. Add Item to Cart
router.post('/add', requireAuth, async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId || !req.mongoUser) return res.status(401).json({ error: 'Unauthorized' });
        
        const { item } = req.body;
        let cart = await Cart.findOne({ userId: req.mongoUser.clerkUserId });

        if (!cart) {
            cart = new Cart({
                userId: req.mongoUser.clerkUserId,
                items: [item]
            });
        } else {
            if (item.type === 'PACK') {
                const existing = cart.items.find(i => i.type === 'PACK' && i.packId?.toString() === item.packId?.toString());
                if (existing) {
                    existing.quantity += (item.quantity || 1);
                } else {
                    cart.items.push(item);
                }
            } else {
                cart.items.push(item);
            }
        }

        cart.totalAmount = calculateTotal(cart.items);
        await cart.save();
        res.status(200).json(cart.toObject());
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(400).json({ error: 'Failed to add item', details: error.message });
    }
});

// 3. Update Item Quantity
router.patch('/update', requireAuth, async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId || !req.mongoUser) return res.status(401).json({ error: 'Unauthorized' });
        
        const { itemId, quantity } = req.body;
        
        let cart = await Cart.findOne({ userId: req.mongoUser.clerkUserId });
        if (cart) {
            const item = cart.items.id(itemId);
            if (item) {
                item.quantity = Math.max(1, quantity);
                cart.totalAmount = calculateTotal(cart.items);
                await cart.save();
            }
        }
        res.json(cart ? cart.toObject() : { items: [], totalAmount: 0 });
    } catch (error) {
        res.status(400).json({ error: 'Failed to update item' });
    }
});

// 4. Remove Item
router.delete('/remove', requireAuth, async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId || !req.mongoUser) return res.status(401).json({ error: 'Unauthorized' });
        
        const { itemId } = req.body;
        let cart = await Cart.findOne({ userId: req.mongoUser.clerkUserId });

        if (cart) {
            cart.items = cart.items.filter(item => item._id.toString() !== itemId);
            cart.totalAmount = calculateTotal(cart.items);
            await cart.save();
        }
        res.json(cart ? cart.toObject() : { items: [], totalAmount: 0 });
    } catch (error) {
        res.status(400).json({ error: 'Failed to remove item' });
    }
});

// 5. Clear Cart (Keeping as is, but ensuring req.mongoUser)
router.delete('/', requireAuth, async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId || !req.mongoUser) return res.status(401).json({ error: 'Unauthorized' });
        await Cart.findOneAndDelete({ userId: req.mongoUser.clerkUserId });
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;
