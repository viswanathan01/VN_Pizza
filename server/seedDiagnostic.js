const mongoose = require('mongoose');
const { Supplier, Ingredient, StockBatch, InventoryLedger } = require('./models');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Create Suppliers
        const suppliers = [
            { 
                name: 'Napoli Flour Co.', 
                contactEmail: 'orders@napoflour.com', 
                contactPhone: '+39 081 1234567',
                suppliedCategories: ['BASE'],
                reliabilityScore: 5
            },
            { 
                name: 'Vesuvius Tomatoes', 
                contactEmail: 'sales@vesuviustom.it', 
                contactPhone: '+39 081 7654321',
                suppliedCategories: ['SAUCE'],
                reliabilityScore: 5
            },
            { 
                name: 'Alpine Dairy Distribution', 
                contactEmail: 'logistics@alpinedairy.ch', 
                contactPhone: '+41 44 9876543',
                suppliedCategories: ['CHEESE'],
                reliabilityScore: 4
            },
            { 
                name: 'Global Fresh Produce', 
                contactEmail: 'info@globalfresh.com', 
                contactPhone: '+1 800 555 0199',
                suppliedCategories: ['VEG_TOPPING', 'MEAT_TOPPING', 'HERB'],
                reliabilityScore: 4
            }
        ];

        await Supplier.deleteMany({});
        const createdSuppliers = await Supplier.insertMany(suppliers);
        console.log(`Created ${createdSuppliers.length} suppliers.`);

        // 2. Create Batches for some ingredients
        const ingredients = await Ingredient.find({});
        if (ingredients.length === 0) {
            console.log('No ingredients found. Please run the main seed script first.');
            process.exit(0);
        }

        await StockBatch.deleteMany({});
        await InventoryLedger.deleteMany({});

        const batches = [];
        const ledgers = [];

        for (let i = 0; i < Math.min(10, ingredients.length); i++) {
            const ing = ingredients[i];
            const supplier = createdSuppliers.find(s => s.suppliedCategories.includes(ing.category)) || createdSuppliers[0];
            
            const batch = {
                ingredientId: ing._id,
                batchId: `BAT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                supplierId: supplier._id,
                quantity: ing.inventory.currentStock || 5000,
                unit: ing.unitType,
                costPerUnit: Math.round(ing.pricePerUnit * 0.6),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                receivedAt: new Date()
            };
            batches.push(batch);

            ledgers.push({
                ingredientId: ing._id,
                action: 'ADD',
                quantity: batch.quantity,
                unit: batch.unit,
                source: 'SYSTEM',
                referenceId: batch.batchId,
                supplierName: supplier.name
            });
        }

        await StockBatch.insertMany(batches);
        await InventoryLedger.insertMany(ledgers);
        console.log(`Created ${batches.length} stock batches and ledgers.`);

        console.log('Diagnostic Seeding Complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seed();
