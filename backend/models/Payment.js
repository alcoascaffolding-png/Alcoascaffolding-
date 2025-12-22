/**
 * Payment Model
 * Money paid to vendors/suppliers
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Reference Information
  paymentNumber: {
    type: String,
    required: true,
    unique: true
  },
  paymentDate: {
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
      ref: 'PurchaseInvoice'
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
  
  // Approval
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  
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

// Auto-generate payment number
paymentSchema.pre('save', async function(next) {
  if (!this.paymentNumber || this.paymentNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Payment').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.paymentNumber = `PMT${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate excess amount
paymentSchema.pre('save', function(next) {
  if (this.invoices && this.invoices.length > 0) {
    const totalAllocated = this.invoices.reduce((sum, inv) => sum + inv.allocatedAmount, 0);
    this.excessAmount = this.amount - totalAllocated;
  } else {
    this.excessAmount = this.amount;
  }
  next();
});

// Additional indexes (unique fields already have indexes)
paymentSchema.index({ vendor: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

