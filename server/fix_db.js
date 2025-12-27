require('dotenv').config();
const mongoose = require('mongoose');

const fixIndexes = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // 1. List existing indexes
        const indexes = await collection.indexes();
        console.log('🔍 Current Indexes:', indexes.map(i => i.name));

        // 2. Drop the broken 'clerkId_1' index if it exists
        if (indexes.find(i => i.name === 'clerkId_1')) {
            console.log('🗑️ Found broken index "clerkId_1". Dropping it...');
            await collection.dropIndex('clerkId_1');
            console.log('✅ Dropped "clerkId_1".');
        } else {
            console.log('ℹ️ Index "clerkId_1" not found. Good.');
        }

        // 3. Ensure "clerkUserId_1" exists
        console.log('🛠️ Ensuring correct index "clerkUserId_1"...');
        await collection.createIndex({ clerkUserId: 1 }, { unique: true });
        console.log('✅ Index "clerkUserId_1" verified.');

        console.log('🏁 DB Fix Complete. You can restart the server now.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing DB:', err);
        process.exit(1);
    }
};

fixIndexes();
