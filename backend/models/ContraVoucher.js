/**
 * Contra Voucher Model
 * Bank-to-bank or cash-to-bank transfers
 */

const mongoose = require('mongoose');

const contraVoucherSchema = new mongoose.Schema({
  // Reference Information
  voucherNumber: {
    type: String,
    required: true,
    unique: true
  },
  voucherDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Transfer Type
  transferType: {
    type: String,
    enum: ['bank_to_bank', 'cash_to_bank', 'bank_to_cash', 'cash_deposit', 'cash_withdrawal'],
    required: true
  },
  
  // From Account
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: true
  },
  fromAccountName: String,
  
  // To Account
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: true
  },
  toAccountName: String,
  
  // Amount
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Transfer Details
  referenceNumber: String,
  chequeNumber: String,
  chequeDate: Date,
  
  // Description
  description: String,
  notes: String,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'cleared', 'cancelled'],
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

// Auto-generate voucher number
contraVoucherSchema.pre('save', async function(next) {
  if (!this.voucherNumber || this.voucherNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('ContraVoucher').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.voucherNumber = `CV${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Additional indexes (unique fields already have indexes)
contraVoucherSchema.index({ status: 1 });
contraVoucherSchema.index({ voucherDate: -1 });

module.exports = mongoose.model('ContraVoucher', contraVoucherSchema);

