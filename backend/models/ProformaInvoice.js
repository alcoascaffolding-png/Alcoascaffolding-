/**
 * Proforma Invoice Model
 * Preliminary invoice before final billing
 */

const mongoose = require('mongoose');

const proformaItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  description: String,
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
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  taxRate: {
    type: Number,
    default: 5
  },
  amount: {
    type: Number,
    required: true
  }
});

const proformaInvoiceSchema = new mongoose.Schema({
  // Reference Information
  proformaNumber: {
    type: String,
    required: true,
    unique: true
  },
  proformaDate: {
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
  
  // Reference Documents
  quoteRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  },
  salesOrderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  },
  
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
  items: [proformaItemSchema],
  
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
  
  // Payment Terms
  paymentTerms: String,
  advancePaymentRequired: {
    type: Number,
    default: 0
  },
  advancePaymentPercentage: {
    type: Number,
    default: 0
  },
  
  // Notes
  termsAndConditions: String,
  notes: String,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'converted', 'expired', 'cancelled'],
    default: 'draft'
  },
  
  // Conversion tracking
  convertedToInvoice: {
    type: Boolean,
    default: false
  },
  invoiceRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesInvoice'
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

// Auto-generate proforma number
proformaInvoiceSchema.pre('save', async function(next) {
  if (!this.proformaNumber || this.proformaNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('ProformaInvoice').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.proformaNumber = `PI${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before saving
proformaInvoiceSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      let itemAmount = item.quantity * item.rate;
      
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
    
    // Calculate advance payment if percentage is given
    if (this.advancePaymentPercentage > 0) {
      this.advancePaymentRequired = (this.total * this.advancePaymentPercentage / 100);
    }
  }
  next();
});

// Additional indexes (unique fields already have indexes)
proformaInvoiceSchema.index({ customer: 1 });
proformaInvoiceSchema.index({ status: 1 });
proformaInvoiceSchema.index({ proformaDate: -1 });

module.exports = mongoose.model('ProformaInvoice', proformaInvoiceSchema);

