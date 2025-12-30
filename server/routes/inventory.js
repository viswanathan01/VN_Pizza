const express = require('express');
const router = express.Router();
const { Ingredient, PizzaPack, InventoryLedger, Supplier, StockBatch } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// --- INGREDIENTS ---

let ingredientsCache = null;
let ingredientsCacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// GET /api/inventory/ingredients - Public (Used by Builder)
router.get('/ingredients', async (req, res) => {
  try {
    const now = Date.now();
    if (ingredientsCache && (now - ingredientsCacheTime < CACHE_DURATION)) {
      return res.json(ingredientsCache);
    }

    const items = await Ingredient.find(
      { isActive: true },
      "name category unitType defaultQuantity pricePerUnit image inventory"
    ).sort({ category: 1, name: 1 }).lean();

    ingredientsCache = items;
    ingredientsCacheTime = now;

    res.json(items);
  } catch (error) {
    console.error('Ingredients query error:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// GET /api/inventory (Admin) - With Pagination
router.get('/', requireAuth, requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const items = await Ingredient.find({})
        .sort({ category: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Ingredient.countDocuments();

      res.json({
        items,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// POST /api/inventory - Manual Ingredient Entry Protocol
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, category, quantity, pricePerUnit, supplierName, unitType, image, credit } = req.body;
    
    const derivedUnit = unitType || (category === 'SAUCE' ? 'ML' : 'GRAM');

    let item = await Ingredient.findOne({ name: name.trim() });
    
    if (item) {
        item.inventory.currentStock += Number(quantity);
        item.pricePerUnit = pricePerUnit || item.pricePerUnit;
        await item.save();
    } else {
        item = new Ingredient({
            name,
            category,
            unitType: derivedUnit,
            defaultQuantity: category === 'BASE' ? 250 : 100,
            pricePerUnit: pricePerUnit || 0,
            image: {
                url: image || `https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop&sig=${category}`,
                source: 'unsplash',
                credit: credit || 'Unsplash'
            },
            inventory: { 
                currentStock: quantity, 
                minThreshold: 100
            }
        });
        await item.save();
    }

    ingredientsCache = null;

    await new InventoryLedger({
        ingredientId: item._id,
        action: 'ADD',
        quantity,
        unit: item.unitType,
        source: 'MANUAL',
        supplierName: supplierName || 'Direct Purchase'
    }).save();

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: 'Manual entry failed', details: error.message });
  }
});

// PATCH /api/inventory/:id - Update Protocol
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { currentStock, minThreshold, pricePerUnit, isActive } = req.body;
    const item = await Ingredient.findById(req.params.id);
    
    if (!item) return res.status(404).json({ error: 'Ingredient not found' });

    if (currentStock !== undefined) {
        const diff = currentStock - item.inventory.currentStock;
        item.inventory.currentStock = currentStock;
        
        await new InventoryLedger({
            ingredientId: item._id,
            action: 'ADJUST',
            quantity: diff,
            unit: item.unitType,
            source: 'MANUAL'
        }).save();
    }

    if (minThreshold !== undefined) item.inventory.minThreshold = minThreshold;
    if (pricePerUnit !== undefined) item.pricePerUnit = pricePerUnit;
    if (isActive !== undefined) item.isActive = isActive;
    
    await item.save();
    ingredientsCache = null;
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// --- PIZZA PACKS ---

let packsCache = null;
let packsCacheTime = 0;

router.get('/packs', async (req, res) => {
    try {
        const now = Date.now();
        if (packsCache && (now - packsCacheTime < CACHE_DURATION)) {
            return res.json(packsCache);
        }

        const packs = await PizzaPack.find(
          {},
          "name description price image category isFeatured ingredientsSnapshot"
        ).lean();

        packsCache = packs;
        packsCacheTime = now;

        res.json(packs);
    } catch (error) {
        console.error('Packs query error:', error);
        res.status(500).json({ error: 'Failed to fetch packs' });
    }
});

// --- LEDGER ---

router.get('/ledger', requireAuth, requireAdmin, async (req, res) => {
    try {
        const logs = await InventoryLedger.find({})
            .sort({ timestamp: -1 })
            .limit(100)
            .populate('ingredientId', 'name category')
            .lean();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ledger' });
    }
});

// --- SUPPLIERS ---

router.get('/suppliers', requireAuth, requireAdmin, async (req, res) => {
    try {
        const suppliers = await Supplier.find({}).lean();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
});

router.post('/suppliers', requireAuth, requireAdmin, async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ error: 'Creation failed' });
    }
});

// --- BATCHES ---

router.get('/batches', requireAuth, requireAdmin, async (req, res) => {
    try {
        const batches = await StockBatch.find({})
            .sort({ receivedAt: -1 })
            .populate('ingredientId', 'name')
            .populate('supplierId', 'name')
            .lean();
        res.json(batches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch batches' });
    }
});

module.exports = router;

module.exports = router;
