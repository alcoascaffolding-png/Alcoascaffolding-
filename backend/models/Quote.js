/**
 * Quote Model
 * Customer quotations/proposals
 */

const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  quantity: {
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
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  taxRate: {
    type: Number,
    default: 5 // UAE VAT 5%
  },
  amount: {
    type: Number,
    required: true
  }
});

const quoteSchema = new mongoose.Schema({
  // Reference Information
  quoteNumber: {
    type: String,
    required: true,
    unique: true
  },
  quoteDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  
  // Billing & Shipping
  billingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  
  // Items
  items: [quoteItemSchema],
  
  // Financial Details
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  shippingCharges: {
    type: Number,
    default: 0
  },
  adjustments: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Terms & Conditions
  termsAndConditions: {
    type: String
  },
  notes: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired'],
    default: 'draft'
  },
  
  // Conversion tracking
  convertedToSalesOrder: {
    type: Boolean,
    default: false
  },
  salesOrderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
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

// Auto-generate quote number
quoteSchema.pre('save', async function(next) {
  if (!this.quoteNumber || this.quoteNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Quote').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.quoteNumber = `QT${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before saving
quoteSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      let itemAmount = item.quantity * item.rate;
      
      // Apply discount
      if (item.discount > 0) {
        if (item.discountType === 'percentage') {
          itemAmount -= (itemAmount * item.discount / 100);
        } else {
          itemAmount -= item.discount;
        }
      }
      
      item.amount = itemAmount;
      return sum + itemAmount;
    }, 0);
    
    this.totalTax = this.items.reduce((sum, item) => {
      return sum + (item.amount * item.taxRate / 100);
    }, 0);
    
    this.total = this.subtotal + this.totalTax + this.shippingCharges + this.adjustments - this.totalDiscount;
  }
  next();
});

// Additional indexes (unique fields already have indexes)
quoteSchema.index({ customer: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ quoteDate: -1 });

module.exports = mongoose.model('Quote', quoteSchema);

