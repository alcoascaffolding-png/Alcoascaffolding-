/**
 * Vendor Model
 * Supplier/vendor master information
 */

const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  // Basic Information
  vendorCode: {
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
  vendorType: {
    type: String,
    enum: ['manufacturer', 'distributor', 'wholesaler', 'retailer', 'service_provider', 'contractor'],
    default: 'distributor'
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
  totalPurchases: {
    type: Number,
    default: 0
  },
  
  // Bank Details
  bankName: String,
  bankAccountNumber: String,
  bankIFSC: String,
  bankBranch: String,
  
  // Business Details
  productCategories: [String],
  paymentTerms: {
    type: String,
    default: 'Net 30'
  },
  notes: String,
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Rating
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
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

// Generate vendor code automatically
vendorSchema.pre('save', async function(next) {
  if (!this.vendorCode) {
    const count = await mongoose.model('Vendor').countDocuments();
    this.vendorCode = `VND${String(count + 1).padStart(5, '0')}`;
  }
  
  if (!this.displayName) {
    this.displayName = this.companyName;
  }
  
  next();
});

// Additional indexes (unique fields already have indexes)
vendorSchema.index({ companyName: 1 });
vendorSchema.index({ status: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);

