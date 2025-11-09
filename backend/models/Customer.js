/**
 * Customer Model
 * Master customer/client information
 */

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Basic Information
  customerCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  customerType: {
    type: String,
    enum: ['individual', 'business', 'government', 'contractor'],
    default: 'business'
  },
  
  // Contact Information
  contactPerson: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  
  // Address
  billingAddress: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'UAE' },
    postalCode: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'UAE' },
    postalCode: String
  },
  
  // Tax Information
  taxNumber: {
    type: String,
    trim: true
  },
  taxRegistered: {
    type: Boolean,
    default: false
  },
  
  // Financial Information
  creditLimit: {
    type: Number,
    default: 0
  },
  creditDays: {
    type: Number,
    default: 30
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  
  // Business Details
  notes: {
    type: String
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
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

// Generate customer code automatically
customerSchema.pre('save', async function(next) {
  if (!this.customerCode) {
    const count = await mongoose.model('Customer').countDocuments();
    this.customerCode = `CUST${String(count + 1).padStart(5, '0')}`;
  }
  
  if (!this.displayName) {
    this.displayName = this.companyName;
  }
  
  next();
});

// Additional indexes (unique fields already have indexes)
customerSchema.index({ companyName: 1 });
customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema);

