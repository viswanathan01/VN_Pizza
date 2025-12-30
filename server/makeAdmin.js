const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    userId: String,
    publicMetadata: Object
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const res = await User.updateMany({}, {
            $set: { 'publicMetadata.role': 'admin' }
        });
        console.log(`Updated ${res.modifiedCount} users to admin role.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

makeAdmin();
