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
    const qty = Number(quantity);
    const derivedUnit = unitType || (category === 'SAUCE' ? 'ML' : 'GRAM');

    let item = await Ingredient.findOne({ name: name.trim() });
    
    if (item) {
        item.inventory.currentStock += qty;
        item.pricePerUnit = pricePerUnit || item.pricePerUnit;
        await item.save();
    } else {
        item = new Ingredient({
            name: name.trim(),
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
                currentStock: qty, 
                minThreshold: 100 
            }
        });
        await item.save();
    }

    // CREATE BATCH FOR MANUAL ENTRY (Consistency)
    await new StockBatch({
        ingredientId: item._id,
        batchId: `ADJ-${Date.now().toString().slice(-6)}`,
        quantity: qty,
        unit: item.unitType,
        costPerUnit: pricePerUnit || item.pricePerUnit || 0,
        receivedAt: new Date()
    }).save();

    ingredientsCache = null;

    await new InventoryLedger({
        ingredientId: item._id,
        action: 'ADD',
        quantity: qty,
        unit: item.unitType,
        source: 'MANUAL',
        supplierName: supplierName || 'Manual Adjustment'
    }).save();

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: 'Manual entry failed', details: error.message });
  }
});

// PATCH /api/inventory/:id - Update Protocol (with Batch Sync)
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { currentStock, minThreshold, pricePerUnit, isActive } = req.body;
    const item = await Ingredient.findById(req.params.id);
    
    if (!item) return res.status(404).json({ error: 'Ingredient not found' });

    if (currentStock !== undefined) {
        const diff = Number(currentStock) - item.inventory.currentStock;
        
        if (diff > 0) {
            // Addition: Create adjustment batch
            await new StockBatch({
                ingredientId: item._id,
                batchId: `ADJ-${Date.now().toString().slice(-6)}`,
                quantity: diff,
                unit: item.unitType,
                costPerUnit: item.pricePerUnit,
                receivedAt: new Date()
            }).save();
        } else if (diff < 0) {
            // Deduction: FIFO from batches
            let remainingToDeduct = Math.abs(diff);
            const batches = await StockBatch.find({ ingredientId: item._id, quantity: { $gt: 0 } }).sort({ receivedAt: 1 });
            
            for (const batch of batches) {
                if (remainingToDeduct <= 0) break;
                const deduct = Math.min(batch.quantity, remainingToDeduct);
                batch.quantity -= deduct;
                await batch.save();
                remainingToDeduct -= deduct;
            }
        }

        item.inventory.currentStock = Number(currentStock);
        
        await new InventoryLedger({
            ingredientId: item._id,
            action: diff >= 0 ? 'ADJUST' : 'REMOVE',
            quantity: Math.abs(diff),
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
    console.error("Inventory Patch Error:", error);
    res.status(400).json({ error: 'Update failed', details: error.message });
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
            .limit(1000)
            .populate('ingredientId', 'name category')
            .lean();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ledger' });
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

router.post('/batches', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { ingredientId, batchId, supplierId, quantity, unit, costPerUnit, expiryDate } = req.body;
        
        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) return res.status(404).json({ error: 'Ingredient not found' });

        // 1. Create Batch
        const newBatch = new StockBatch({
            ingredientId,
            batchId,
            supplierId,
            quantity,
            unit,
            costPerUnit,
            expiryDate
        });
        await newBatch.save();

        // 2. Update Ingredient Stock
        ingredient.inventory.currentStock += Number(quantity);
        await ingredient.save();

        // 3. Ledger Entry
        await new InventoryLedger({
            ingredientId,
            action: 'ADD',
            quantity,
            unit,
            source: 'MANUAL', // "Batch" source effectively manual entry for now
            referenceId: batchId,
            supplierName: (await Supplier.findById(supplierId))?.name || 'Unknown'
        }).save();

        // Bust Cache
        ingredientsCache = null;

        res.status(201).json(newBatch);
    } catch (error) {
        console.error("Batch Create Error:", error);
        res.status(400).json({ error: 'Failed to create batch' });
    }
});

router.put('/batches/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { quantity, costPerUnit, expiryDate } = req.body;
        const batch = await StockBatch.findById(req.params.id);
        if (!batch) return res.status(404).json({ error: 'Batch not found' });

        const ingredient = await Ingredient.findById(batch.ingredientId);
        
        // Handle Quantity Adjustment
        if (quantity !== undefined && quantity !== batch.quantity) {
            const delta = Number(quantity) - batch.quantity;
            if (ingredient) {
                ingredient.inventory.currentStock += delta;
                await ingredient.save();
                
                await new InventoryLedger({
                    ingredientId: ingredient._id,
                    action: delta > 0 ? 'ADD' : 'REMOVE',
                    quantity: Math.abs(delta),
                    unit: batch.unit,
                    source: 'MANUAL',
                    referenceId: batch.batchId,
                    supplierName: 'Batch Correction'
                }).save();
            }
            batch.quantity = Number(quantity);
        }

        if (costPerUnit !== undefined) batch.costPerUnit = costPerUnit;
        if (expiryDate !== undefined) batch.expiryDate = expiryDate;

        await batch.save();
        ingredientsCache = null;

        res.json(batch);
    } catch (error) {
        console.error("Batch Update Error:", error);
        res.status(400).json({ error: 'Failed to update batch' });
    }
});

router.delete('/batches/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const batch = await StockBatch.findById(req.params.id);
        if (!batch) return res.status(404).json({ error: 'Batch not found' });

        // Reverse Stock
        const ingredient = await Ingredient.findById(batch.ingredientId);
        if (ingredient) {
            ingredient.inventory.currentStock -= batch.quantity;
            // Prevent negative? allowed for correction.
            await ingredient.save();

            await new InventoryLedger({
                ingredientId: ingredient._id,
                action: 'REMOVE',
                quantity: batch.quantity,
                unit: batch.unit,
                source: 'MANUAL',
                referenceId: batch.batchId,
                supplierName: 'Batch Deletion'
            }).save();
        }

        await StockBatch.findByIdAndDelete(req.params.id);
        ingredientsCache = null;
        
        res.json({ message: 'Batch deleted and stock reversed' });
    } catch (error) {
        console.error("Batch Delete Error:", error);
        res.status(500).json({ error: 'Failed to delete batch' });
    }
});

module.exports = router;
