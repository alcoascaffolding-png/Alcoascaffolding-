/**
 * Stock Adjustment Model
 * Inventory adjustments and stock movements
 */

const mongoose = require('mongoose');

const adjustmentItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  itemName: String,
  itemCode: String,
  currentStock: {
    type: Number,
    required: true
  },
  adjustedStock: {
    type: Number,
    required: true
  },
  difference: {
    type: Number,
    required: true
  },
  unit: String,
  reason: {
    type: String,
    enum: ['damaged', 'expired', 'lost', 'found', 'return', 'correction', 'other'],
    default: 'correction'
  },
  reasonDetails: String,
  costPerUnit: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  }
});

const stockAdjustmentSchema = new mongoose.Schema({
  // Reference Information
  adjustmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  adjustmentDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Adjustment Type
  adjustmentType: {
    type: String,
    enum: ['quantity', 'value', 'both'],
    default: 'quantity'
  },
  
  // Reason
  adjustmentReason: {
    type: String,
    enum: ['physical_count', 'damage', 'theft', 'expired', 'return', 'correction', 'opening_stock', 'other'],
    required: true
  },
  
  // Warehouse/Location
  warehouse: {
    type: String
  },
  
  // Items
  items: [adjustmentItemSchema],
  
  // Total Value Impact
  totalValueImpact: {
    type: Number,
    default: 0
  },
  
  // Notes
  notes: String,
  
  // Attachments (e.g., photos of damaged items)
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedDate: Date
  }],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },
  
  // Approval
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  approvalNotes: String,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate adjustment number
stockAdjustmentSchema.pre('save', async function(next) {
  if (!this.adjustmentNumber || this.adjustmentNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('StockAdjustment').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.adjustmentNumber = `ADJ${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before saving
stockAdjustmentSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalValueImpact = this.items.reduce((sum, item) => {
      item.totalValue = item.difference * item.costPerUnit;
      return sum + item.totalValue;
    }, 0);
  }
  next();
});

// Additional indexes (unique fields already have indexes)
stockAdjustmentSchema.index({ status: 1 });
stockAdjustmentSchema.index({ adjustmentDate: -1 });
stockAdjustmentSchema.index({ warehouse: 1 });

module.exports = mongoose.model('StockAdjustment', stockAdjustmentSchema);

