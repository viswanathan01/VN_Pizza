const mongoose = require('mongoose');

// 1. User Schema (Authoritative Sync via Clerk Webhooks)
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
  role: { type: String, enum: ['USER', 'ADMIN', 'CHEF', 'DELIVERY'], default: 'USER' },
  contactNumber: { type: String },
  savedAddress: {
    label: { type: String },
    addressLine: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  }
}, { timestamps: true });

// 2. Supplier Schema
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: { type: String },
  contactPhone: { type: String },
  suppliedCategories: [{ 
    type: String, 
    enum: ['BASE', 'SAUCE', 'CHEESE', 'VEG_TOPPING', 'MEAT_TOPPING', 'HERB', 'SPICE', 'EXTRA'] 
  }],
  reliabilityScore: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 3. Ingredient Schema (Strictly Pizza-Related)
const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['BASE', 'SAUCE', 'CHEESE', 'VEG_TOPPING', 'MEAT_TOPPING', 'HERB', 'SPICE', 'EXTRA'] 
  },
  unitType: { 
    type: String, 
    enum: ['GRAM', 'ML', 'COUNT'], 
    required: true 
  },
  defaultQuantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  image: {
    url: String,
    source: { type: String, default: 'unsplash' },
    credit: String
  },
  inventory: {
    currentStock: { type: Number, default: 0 },
    minThreshold: { type: Number, default: 100 }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

ingredientSchema.index({ category: 1, isActive: 1 });

// 4. Stock Batch Schema (FIFO Support)
const stockBatchSchema = new mongoose.Schema({
  ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  batchId: { type: String, required: true, unique: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  costPerUnit: { type: Number, required: true },
  expiryDate: { type: Date },
  receivedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// 5. Inventory Ledger Schema (Audit Trail)
const inventoryLedgerSchema = new mongoose.Schema({
  ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  action: { type: String, enum: ['ADD', 'REMOVE', 'ADJUST'], required: true },
  quantity: { type: Number, required: true },
  unit: String,
  source: { type: String, enum: ['MANUAL', 'ORDER', 'SYSTEM'], required: true },
  referenceId: String,
  supplierName: String,
  timestamp: { type: Date, default: Date.now }
});

// 6. Predefined Pizza Pack Schema (Immutable Snapshots)
const pizzaPackSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['CLASSIC', 'VEG', 'NON_VEG', 'SPICY', 'PREMIUM'], 
    required: true 
  },
  ingredientsSnapshot: {
    base: { type: Object },
    sauce: { type: Object },
    cheeses: [{ type: Object }],
    toppings: [{ type: Object }]
  },
  price: { type: Number, required: true },
  image: {
    url: String,
    source: { type: String, default: 'unsplash' },
    credit: String
  },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

pizzaPackSchema.index({ category: 1, isFeatured: 1 });

// 7. Order Schema
// 7. Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  customer: {
    name: { type: String, required: true },
    contactNumber: { type: String, required: true }
  },

  deliveryAddress: {
    label: { type: String }, // Home, Work, Other
    addressLine: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number }
  },

  items: [{
    name: String,
    description: String,
    price: Number,
    quantity: Number,
    packId: { type: mongoose.Schema.Types.ObjectId, ref: 'PizzaPack' },
    snapshot: Object
  }],

  totalPrice: { type: Number, required: true },
  paymentId: { type: String },

  status: {
    type: String,
    enum: [
      'ORDER_RECEIVED',
      'IN_KITCHEN',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'PAYMENT_FAILED'
    ],
    default: 'ORDER_RECEIVED'
  },

  updatedByRole: {
    type: String,
    enum: ['USER', 'CHEF', 'DELIVERY', 'ADMIN']
  }

}, { timestamps: true });

orderSchema.index({ userId: 1, createdAt: -1 });

// 8. Cart Schema (Persistent)
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  items: [
    {
      type: { type: String, enum: ['CUSTOM', 'PACK'], required: true },
      packId: { type: mongoose.Schema.Types.ObjectId, ref: 'PizzaPack' },
      snapshot: { type: Object }, // Contains base, sauce, cheeses, toppings
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 }
    }
  ],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);
const Ingredient = mongoose.model('Ingredient', ingredientSchema);
const StockBatch = mongoose.model('StockBatch', stockBatchSchema);
const InventoryLedger = mongoose.model('InventoryLedger', inventoryLedgerSchema);
const PizzaPack = mongoose.model('PizzaPack', pizzaPackSchema);
const Order = mongoose.model('Order', orderSchema);
const Cart = mongoose.model('Cart', cartSchema);

module.exports = { 
  User, Supplier, Ingredient, StockBatch, 
  InventoryLedger, PizzaPack, Order, Cart
};
