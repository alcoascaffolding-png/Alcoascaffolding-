/**
 * Receipt Model
 * Money received from customers
 */

const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  // Reference Information
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  receiptDate: {
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
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'cheque', 'bank_transfer', 'credit_card', 'debit_card', 'upi', 'other'],
    required: true
  },
  
  // Bank/Payment Details
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  chequeNumber: String,
  chequeDate: Date,
  transactionReference: String,
  
  // Invoice Allocation
  invoices: [{
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesInvoice'
    },
    invoiceNumber: String,
    invoiceAmount: Number,
    allocatedAmount: Number
  }],
  
  // Excess/Advance
  excessAmount: {
    type: Number,
    default: 0
  },
  
  // Notes
  notes: String,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'cleared', 'bounced', 'cancelled'],
    default: 'draft'
  },
  
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

// Auto-generate receipt number
receiptSchema.pre('save', async function(next) {
  if (!this.receiptNumber || this.receiptNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Receipt').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.receiptNumber = `RCP${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate excess amount
receiptSchema.pre('save', function(next) {
  if (this.invoices && this.invoices.length > 0) {
    const totalAllocated = this.invoices.reduce((sum, inv) => sum + inv.allocatedAmount, 0);
    this.excessAmount = this.amount - totalAllocated;
  } else {
    this.excessAmount = this.amount;
  }
  next();
});

// Additional indexes (unique fields already have indexes)
receiptSchema.index({ customer: 1 });
receiptSchema.index({ status: 1 });
receiptSchema.index({ receiptDate: -1 });

module.exports = mongoose.model('Receipt', receiptSchema);

