/**
 * Bank Account Model
 * Company bank accounts
 */

const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  // Account Information
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  bankName: {
    type: String,
    required: true
  },
  branchName: String,
  ifscCode: String,
  swiftCode: String,
  
  // Account Type
  accountType: {
    type: String,
    enum: ['savings', 'current', 'cash', 'credit_card'],
    default: 'current'
  },
  
  // Currency
  currency: {
    type: String,
    default: 'AED'
  },
  
  // Balance
  openingBalance: {
    type: Number,
    default: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  
  // Additional Details
  description: String,
  notes: String,
  
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

// Ensure only one primary account per currency
bankAccountSchema.pre('save', async function(next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    await mongoose.model('BankAccount').updateMany(
      { currency: this.currency, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

// Additional indexes (unique fields already have indexes)
bankAccountSchema.index({ isActive: 1 });
bankAccountSchema.index({ currency: 1 });

module.exports = mongoose.model('BankAccount', bankAccountSchema);

