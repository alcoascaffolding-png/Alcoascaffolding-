/**
 * Sales Return Model
 * Customer returns and credit notes
 */

const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
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
    enum: ['defective', 'damaged', 'wrong_item', 'excess', 'customer_request', 'other'],
    default: 'other'
  },
  reasonDetails: String
});

const salesReturnSchema = new mongoose.Schema({
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
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: String,
  
  // Reference Documents
  salesInvoiceRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesInvoice'
  },
  deliveryNoteRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryNote'
  },
  
  // Items
  items: [returnItemSchema],
  
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
    enum: ['cash', 'bank_transfer', 'credit_note', 'replacement'],
    default: 'credit_note'
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
salesReturnSchema.pre('save', async function(next) {
  if (!this.returnNumber || this.returnNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('SalesReturn').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.returnNumber = `SR${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before saving
salesReturnSchema.pre('save', function(next) {
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
salesReturnSchema.index({ customer: 1 });
salesReturnSchema.index({ status: 1 });
salesReturnSchema.index({ returnDate: -1 });

module.exports = mongoose.model('SalesReturn', salesReturnSchema);

