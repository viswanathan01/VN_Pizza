require('dotenv').config();
const mongoose = require('mongoose');
const { clerkClient } = require('@clerk/clerk-sdk-node');

const promote = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'alamelurajasekar1234@gmail.com';
        
        console.log(`Promoting ${email}...`);
        
        // 1. Update Mongo
        const res = await mongoose.connection.db.collection('users').findOneAndUpdate(
            { email },
            { $set: { role: 'ADMIN' } },
            { returnDocument: 'after' }
        );
        
        if (!res) {
             console.log('User not found in Condo.');
        } else {
             console.log('✅ Mongo Updated:', res.value?.role || 'Admin');
             
             // 2. Update Clerk Metadata (if possible, though the frontend will likely need a refresh)
             if (res.clerkUserId) {
                 try {
                     await clerkClient.users.updateUserMetadata(res.clerkUserId, {
                        publicMetadata: { role: 'ADMIN' }
                     });
                     console.log('✅ Clerk Metadata Updated');
                 } catch (e) {
                     console.log('⚠️ Clerk update skipped:', e.message);
                 }
             }
        }
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

promote();
