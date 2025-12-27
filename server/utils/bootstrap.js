const axios = require('axios');
const { InventoryItem } = require('../models/index');

const bootstrapInventory = async () => {
    // Disabled for stability. Inventory is already populated.
    // Re-enable if you need to seed a fresh database.
    console.log('⏩ Skipping Inventory Bootstrap (Stability Mode)');
    return;
};

module.exports = { bootstrapInventory };
