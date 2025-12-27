const express = require('express');
const router = express.Router();
const { InventoryItem } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/inventory - Public/User
router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find({}).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// POST /api/inventory - Admin only
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, category, quantity, threshold, unit, price, imageUrl } = req.body;
    const newItem = new InventoryItem({ 
        name, 
        category: category.toUpperCase(), 
        quantity, 
        threshold,
        unit,
        price,
        imageUrl
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create item', details: error.message });
  }
});

// PATCH /api/inventory/:id - Admin only
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: Date.now() };
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update item' });
  }
});

module.exports = router;
