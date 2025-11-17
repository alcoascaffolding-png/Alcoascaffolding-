/**
 * Quotation Model
 * Manages quotes for equipment rental and sales
 */

const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  equipmentType: {
    type: String,
    required: true,
    trim: true
  },
  equipmentCode: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Additional specifications
  specifications: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: 0
  },
  cbm: {
    type: Number,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    default: 'Nos',
    trim: true
  },
  rentalDuration: {
    value: Number,
    unit: {
      type: String,
      enum: ['day', 'week', 'month'],
      default: 'day'
    }
  },
  ratePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  taxableAmount: {
    type: Number,
    min: 0
  },
  vatPercentage: {
    type: Number,
    default: 5,
    min: 0
  },
  vatAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  itemImage: {
    type: String,
    trim: true
  }
}, { _id: true });

const quotationSchema = new mongoose.Schema({
  // Quote Identification
  quoteNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerAddress: {
    type: String,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  customerTRN: {
    type: String,
    trim: true
  },
  contactPersonName: {
    type: String,
    trim: true
  },
  contactPersonDesignation: {
    type: String,
    trim: true
  },
  contactPersonEmail: {
    type: String,
    trim: true
  },
  contactPersonPhone: {
    type: String,
    trim: true
  },
  
  // Quote Details
  quoteDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  validUntil: {
    type: Date,
    required: true,
    index: true
  },
  quoteType: {
    type: String,
    enum: ['rental', 'sales', 'service', 'both'],
    default: 'rental',
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'approved', 'rejected', 'expired', 'converted'],
    default: 'draft',
    index: true
  },
  
  // Professional Details
  subject: {
    type: String,
    trim: true
  },
  salesExecutive: {
    type: String,
    trim: true
  },
  preparedBy: {
    type: String,
    trim: true
  },
  customerPONumber: {
    type: String,
    trim: true
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  paymentTerms: {
    type: String,
    default: 'Cash/CDC',
    trim: true
  },
  deliveryTerms: {
    type: String,
    default: '7-10 days from date of order',
    trim: true
  },
  projectDuration: {
    type: String,
    trim: true
  },
  
  // Items
  items: [quotationItemSchema],
  
  // Financial Details
  subtotal: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  deliveryCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  installationCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  pickupCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  },
  vatPercentage: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },
  vatAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'AED'
  },
  
  // Delivery Details
  deliveryAddress: {
    addressLine1: String,
    addressLine2: String,
    area: String,
    city: String,
    emirate: String,
    landmark: String
  },
  deliveryDate: {
    type: Date
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
  termsAndConditions: {
    type: String,
    trim: true
  },
  
  // Communication
  sentDate: {
    type: Date
  },
  viewedDate: {
    type: Date
  },
  emailsSent: [{
    sentAt: Date,
    sentTo: String,
    subject: String,
    status: {
      type: String,
      enum: ['sent', 'failed', 'bounced']
    }
  }],
  whatsappSent: [{
    sentAt: Date,
    sentTo: String,
    messageSid: String,
    status: {
      type: String,
      enum: ['sent', 'failed', 'delivered', 'read']
    }
  }],
  
  // Follow-up
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String,
    trim: true
  },
  
  // Conversion
  convertedToOrder: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalOrder'
  },
  convertedAt: {
    type: Date
  },
  
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
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

// Indexes
quotationSchema.index({ quoteNumber: 'text', customerName: 'text' });
quotationSchema.index({ status: 1, quoteDate: -1 });
quotationSchema.index({ customer: 1, status: 1 });
quotationSchema.index({ validUntil: 1 });
quotationSchema.index({ createdAt: -1 });

// Virtual for checking if expired
quotationSchema.virtual('isExpired').get(function() {
  return this.validUntil < new Date() && this.status !== 'approved' && this.status !== 'converted';
});

// Virtual for days until expiry
quotationSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const validUntil = new Date(this.validUntil);
  const diff = Math.ceil((validUntil - today) / (1000 * 60 * 60 * 24));
  return diff;
});

// Method to calculate totals
quotationSchema.methods.calculateTotals = function() {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Add additional charges
  let beforeVAT = this.subtotal + 
                  (this.deliveryCharges || 0) + 
                  (this.installationCharges || 0) + 
                  (this.pickupCharges || 0);
  
  // Apply discount
  if (this.discount > 0) {
    if (this.discountType === 'percentage') {
      beforeVAT -= (beforeVAT * this.discount / 100);
    } else {
      beforeVAT -= this.discount;
    }
  }
  
  // Calculate VAT
  this.vatAmount = (beforeVAT * this.vatPercentage / 100);
  
  // Calculate total
  this.totalAmount = beforeVAT + this.vatAmount;
  
  return this.totalAmount;
};

// Generate quote number
quotationSchema.statics.generateQuoteNumber = async function() {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;
  
  const lastQuote = await this.findOne({
    quoteNumber: new RegExp(`^${prefix}`)
  }).sort({ quoteNumber: -1 });
  
  let number = 1;
  if (lastQuote) {
    const lastNumber = parseInt(lastQuote.quoteNumber.split('-')[2]);
    number = lastNumber + 1;
  }
  
  return `${prefix}${String(number).padStart(4, '0')}`;
};

// Pre-save middleware
quotationSchema.pre('save', function(next) {
  // Calculate totals before saving
  if (this.items && this.items.length > 0) {
    this.calculateTotals();
  }
  
  // Check if expired
  if (this.validUntil < new Date() && this.status === 'sent') {
    this.status = 'expired';
  }
  
  next();
});

// Static method to get statistics
quotationSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        statusCounts: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        typeCounts: [
          { $group: { _id: '$quoteType', count: { $sum: 1 } } }
        ],
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              totalValue: { $sum: '$totalAmount' },
              approvedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
              },
              approvedValue: {
                $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$totalAmount', 0] }
              }
            }
          }
        ],
        thisMonth: [
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              value: { $sum: '$totalAmount' }
            }
          }
        ]
      }
    }
  ]);

  return stats[0];
};

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;

