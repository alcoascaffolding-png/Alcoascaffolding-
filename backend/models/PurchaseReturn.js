/**
 * Purchase Return Model
 * Returns to vendors and debit notes
 */

const mongoose = require('mongoose');

const purchaseReturnItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  description: String,
  returnedQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'pcs'
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 5
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: ['defective', 'damaged', 'wrong_item', 'excess', 'quality_issue', 'other'],
    default: 'other'
  },
  reasonDetails: String
});

const purchaseReturnSchema = new mongoose.Schema({
  // Reference Information
  returnNumber: {
    type: String,
    required: true,
    unique: true
  },
  returnDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Vendor Information
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: String,
  
  // Reference Documents
  purchaseInvoiceRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseInvoice'
  },
  purchaseOrderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  },
  
  // Items
  items: [purchaseReturnItemSchema],
  
  // Financial Details
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Refund Details
  refundMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'debit_note', 'replacement'],
    default: 'debit_note'
  },
  refundStatus: {
    type: String,
    enum: ['pending', 'approved', 'refunded', 'rejected'],
    default: 'pending'
  },
  refundDate: Date,
  refundReference: String,
  
  // Notes
  notes: String,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'completed', 'cancelled'],
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

// Auto-generate return number
purchaseReturnSchema.pre('save', async function(next) {
  if (!this.returnNumber || this.returnNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('PurchaseReturn').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.returnNumber = `PR${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before saving
purchaseReturnSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      item.amount = item.returnedQuantity * item.rate;
      return sum + item.amount;
    }, 0);
    
    this.totalTax = this.items.reduce((sum, item) => {
      return sum + (item.amount * item.taxRate / 100);
    }, 0);
    
    this.total = this.subtotal + this.totalTax;
  }
  next();
});

// Additional indexes (unique fields already have indexes)
purchaseReturnSchema.index({ vendor: 1 });
purchaseReturnSchema.index({ status: 1 });
purchaseReturnSchema.index({ returnDate: -1 });

module.exports = mongoose.model('PurchaseReturn', purchaseReturnSchema);

