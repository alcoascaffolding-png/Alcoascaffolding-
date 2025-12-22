/**
 * Stock Movement Model
 * Track all inventory movements (in/out)
 */

const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  // Product Information
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  itemCode: String,
  itemName: String,
  
  // Movement Details
  movementType: {
    type: String,
    enum: ['in', 'out', 'transfer'],
    required: true
  },
  
  // Transaction Type
  transactionType: {
    type: String,
    enum: [
      'purchase',
      'purchase_return',
      'sales',
      'sales_return',
      'adjustment',
      'transfer',
      'opening_stock',
      'damage',
      'other'
    ],
    required: true
  },
  
  // Reference Document
  referenceType: {
    type: String,
    enum: ['PurchaseOrder', 'PurchaseInvoice', 'SalesOrder', 'SalesInvoice', 'StockAdjustment', 'DeliveryNote', 'SalesReturn', 'PurchaseReturn']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  referenceNumber: String,
  
  // Quantity
  quantity: {
    type: Number,
    required: true
  },
  unit: String,
  
  // Stock Levels
  previousStock: {
    type: Number,
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  
  // Value
  costPerUnit: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  
  // Location
  fromWarehouse: String,
  toWarehouse: String,
  
  // Date
  movementDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Notes
  notes: String,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate stock levels and total value before saving
stockMovementSchema.pre('save', function(next) {
  this.totalValue = this.quantity * this.costPerUnit;
  
  if (this.movementType === 'in') {
    this.currentStock = this.previousStock + this.quantity;
  } else if (this.movementType === 'out') {
    this.currentStock = this.previousStock - this.quantity;
  }
  
  next();
});

// Indexes
stockMovementSchema.index({ product: 1 });
stockMovementSchema.index({ movementType: 1 });
stockMovementSchema.index({ transactionType: 1 });
stockMovementSchema.index({ movementDate: -1 });
stockMovementSchema.index({ referenceType: 1, referenceId: 1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);

