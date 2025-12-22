/**
 * Product/Item Model
 * Inventory items and products
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Information
  itemCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    required: true,
    enum: ['scaffolding', 'ladders', 'accessories', 'safety_equipment', 'spare_parts', 'other']
  },
  subcategory: {
    type: String
  },
  
  // Product Type
  itemType: {
    type: String,
    enum: ['goods', 'service'],
    default: 'goods'
  },
  
  // Units
  primaryUnit: {
    type: String,
    required: true,
    default: 'pcs'
  },
  secondaryUnit: {
    type: String
  },
  conversionFactor: {
    type: Number,
    default: 1
  },
  
  // Barcode
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Pricing
  purchasePrice: {
    type: Number,
    default: 0,
    min: 0
  },
  sellingPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  mrp: {
    type: Number,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 5
  },
  
  // Stock Details
  currentStock: {
    type: Number,
    default: 0
  },
  minStockLevel: {
    type: Number,
    default: 0
  },
  maxStockLevel: {
    type: Number,
    default: 0
  },
  reorderLevel: {
    type: Number,
    default: 0
  },
  reorderQuantity: {
    type: Number,
    default: 0
  },
  
  // Location
  warehouse: {
    type: String
  },
  rackNumber: {
    type: String
  },
  binNumber: {
    type: String
  },
  
  // Supplier Information
  preferredVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  vendors: [{
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    vendorItemCode: String,
    vendorPrice: Number,
    leadTime: Number // in days
  }],
  
  // Specifications
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: { type: String, default: 'cm' }
    },
    material: String,
    color: String,
    brand: String,
    model: String
  },
  
  // Images
  images: [{
    url: String,
    isPrimary: Boolean,
    caption: String
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isTrackInventory: {
    type: Boolean,
    default: true
  },
  
  // Additional Info
  notes: String,
  tags: [String],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate item code automatically
productSchema.pre('save', async function(next) {
  if (!this.itemCode) {
    const count = await mongoose.model('Product').countDocuments();
    this.itemCode = `ITM${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Check low stock
productSchema.methods.isLowStock = function() {
  return this.currentStock <= this.reorderLevel;
};

// Check out of stock
productSchema.methods.isOutOfStock = function() {
  return this.currentStock <= 0;
};

// Additional indexes (unique fields already have indexes)
productSchema.index({ itemName: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ currentStock: 1 });

module.exports = mongoose.model('Product', productSchema);

