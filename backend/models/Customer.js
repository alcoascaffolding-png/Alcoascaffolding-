/**
 * Customer Model
 * Stores customer/company information for scaffolding business
 * Supports B2B relationships with construction companies and contractors
 */

const mongoose = require('mongoose');

const contactPersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
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
    required: true,
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['primary', 'site', 'accounts', 'other'],
    default: 'other'
  }
}, { _id: true });

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['office', 'billing', 'site', 'other'],
    default: 'other'
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  area: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  emirate: {
    type: String,
    enum: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
    required: true
  },
  country: {
    type: String,
    default: 'UAE',
    trim: true
  },
  poBox: {
    type: String,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const customerSchema = new mongoose.Schema({
  // Company Information
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true
  },
  displayName: {
    type: String,
    trim: true
  },
  tradeLicenseNumber: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  vatRegistrationNumber: {
    type: String,
    trim: true,
    sparse: true
  },
  businessType: {
    type: String,
    enum: ['Construction Company', 'Contractor', 'Facility Management', 'Government', 'Individual', 'Other'],
    default: 'Construction Company'
  },
  industry: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },

  // Contact Information
  contactPersons: [contactPersonSchema],
  addresses: [addressSchema],

  // Primary Contact (Quick Access)
  primaryEmail: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  primaryPhone: {
    type: String,
    trim: true,
    index: true
  },
  primaryWhatsApp: {
    type: String,
    trim: true
  },

  // Financial Information
  paymentTerms: {
    type: String,
    enum: ['Cash', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', 'Custom'],
    default: 'Cash'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'AED'
  },

  // Status & Classification
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'prospect'],
    default: 'prospect',
    index: true
  },
  customerType: {
    type: String,
    enum: ['rental', 'sales', 'both'],
    default: 'both'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'vip'],
    default: 'medium'
  },

  // Business Relationship
  customerSince: {
    type: Date,
    default: Date.now
  },
  lastOrderDate: {
    type: Date
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },

  // Additional Information
  notes: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],

  // Reference & Source
  referredBy: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['Website', 'Phone Call', 'Walk-in', 'Referral', 'Social Media', 'Email', 'Other'],
    default: 'Website'
  },

  // Documents (store file paths or URLs)
  documents: [{
    type: {
      type: String,
      enum: ['Trade License', 'VAT Certificate', 'Emirates ID', 'Contract', 'Other']
    },
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // System Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
customerSchema.index({ companyName: 'text', primaryEmail: 'text', primaryPhone: 'text' });
customerSchema.index({ status: 1, customerType: 1 });
customerSchema.index({ createdAt: -1 });

// Virtual for credit status
customerSchema.virtual('creditStatus').get(function() {
  if (this.creditLimit === 0) return 'No Credit';
  const usedPercentage = (this.currentBalance / this.creditLimit) * 100;
  if (usedPercentage >= 100) return 'Credit Limit Reached';
  if (usedPercentage >= 80) return 'Credit Warning';
  return 'Good';
});

// Virtual for full primary address
customerSchema.virtual('primaryAddress').get(function() {
  if (!this.addresses || this.addresses.length === 0) return null;
  const primary = this.addresses.find(addr => addr.isPrimary);
  return primary || this.addresses[0];
});

// Virtual for full primary contact
customerSchema.virtual('primaryContact').get(function() {
  if (!this.contactPersons || this.contactPersons.length === 0) return null;
  const primary = this.contactPersons.find(contact => contact.isPrimary);
  return primary || this.contactPersons[0];
});

// Method to update primary contact info
customerSchema.methods.updatePrimaryContact = function() {
  if (!this.contactPersons || this.contactPersons.length === 0) return;
  const primary = this.contactPersons.find(contact => contact.isPrimary) || this.contactPersons[0];
  if (primary) {
    this.primaryEmail = primary.email;
    this.primaryPhone = primary.phone;
    this.primaryWhatsApp = primary.whatsapp || primary.phone;
  }
};

// Pre-save middleware to ensure only one primary contact/address
customerSchema.pre('save', function(next) {
  // Ensure only one primary contact
  if (this.contactPersons && this.contactPersons.length > 0) {
    let primaryContactFound = false;
    this.contactPersons.forEach(contact => {
      if (contact.isPrimary && !primaryContactFound) {
        primaryContactFound = true;
      } else if (contact.isPrimary) {
        contact.isPrimary = false;
      }
    });
  }

  // Ensure only one primary address
  if (this.addresses && this.addresses.length > 0) {
    let primaryAddressFound = false;
    this.addresses.forEach(address => {
      if (address.isPrimary && !primaryAddressFound) {
        primaryAddressFound = true;
      } else if (address.isPrimary) {
        address.isPrimary = false;
      }
    });
  }

  // Update primary contact fields
  this.updatePrimaryContact();

  // Set display name if not provided
  if (!this.displayName) {
    this.displayName = this.companyName;
  }

  next();
});

// Static method to get customer statistics
customerSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        statusCounts: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        typeCounts: [
          { $group: { _id: '$customerType', count: { $sum: 1 } } }
        ],
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              activeCustomers: {
                $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
              },
              totalRevenue: { $sum: '$totalRevenue' },
              totalOrders: { $sum: '$totalOrders' }
            }
          }
        ]
      }
    }
  ]);

  return stats[0];
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
