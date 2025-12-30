const express = require('express');
const router = express.Router();
const { Supplier } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/suppliers - List all suppliers
router.get('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const suppliers = await Supplier.find({}).sort({ name: 1 }).lean();
        res.json(suppliers);
    } catch (error) {
        console.error('Fetch Suppliers Error:', error);
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
});

// POST /api/suppliers - Create new supplier
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, contactEmail, contactPhone, suppliedCategories } = req.body;

        if (!name) return res.status(400).json({ error: 'Name is required' });

        const supplier = new Supplier({
            name,
            contactEmail,
            contactPhone,
            suppliedCategories,
            isActive: true
        });

        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        console.error('Create Supplier Error:', error);
        res.status(400).json({ error: 'Failed to create supplier' });
    }
});

// PUT /api/suppliers/:id - Update supplier
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, contactEmail, contactPhone, suppliedCategories, isActive } = req.body;
        
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

        supplier.name = name || supplier.name;
        supplier.contactEmail = contactEmail || supplier.contactEmail;
        supplier.contactPhone = contactPhone || supplier.contactPhone;
        supplier.suppliedCategories = suppliedCategories || supplier.suppliedCategories;
        if (isActive !== undefined) supplier.isActive = isActive;

        await supplier.save();
        res.json(supplier);
    } catch (error) {
        console.error('Update Supplier Error:', error);
        res.status(400).json({ error: 'Failed to update supplier' });
    }
});

// DELETE /api/suppliers/:id - Delete (or soft delete) supplier
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Hard delete allowed for now, assuming referential integrity is checked by admin manually or via frontend warnings
        // Alternatively, use soft-delete by setting isActive: false
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
        
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error('Delete Supplier Error:', error);
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
});

module.exports = router;
