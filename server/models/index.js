const mongoose = require('mongoose');

// User Schema (Authoritative Sync via Clerk Webhooks)
const userSchema = new mongoose.Schema({
  clerkUserId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  email: { type: String, required: true }, 
  username: { type: String },
  fullName: { type: String },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
}, { timestamps: true });

// Inventory Item Schema
const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['BASE', 'SAUCE', 'CHEESE', 'VEGGIE', 'MEAT'] 
  },
  quantity: { type: Number, required: true, default: 500 },
  unit: { type: String, required: true, default: 'grams' },
  price: { type: Number, required: true, default: 0 },
  threshold: { type: Number, required: true, default: 50 }, 
  imageUrl: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

// Pizza Item Schema (Embedded in Order)
const pizzaItemSchema = new mongoose.Schema({
  base: { type: String, required: true },
  sauce: { type: String, required: true },
  cheese: { type: String, required: true },
  veggies: [{ type: String }],
  meat: { type: String }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk User ID
  items: [pizzaItemSchema],
  totalPrice: { type: Number, required: true },
  paymentId: { type: String },
  status: { 
    type: String, 
    enum: ['ORDER_RECEIVED', 'IN_KITCHEN', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAYMENT_FAILED'], 
    default: 'ORDER_RECEIVED' 
  },
  contactNumber: { type: String }, // User contact for delivery
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { User, InventoryItem, Order };
