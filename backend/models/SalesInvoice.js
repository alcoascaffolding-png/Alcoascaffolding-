/**
 * Sales Invoice Model
 * Customer invoices for billing
 */

const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
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

const salesInvoiceSchema = new mongoose.Schema({
  // Reference Information
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
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
  salesOrderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  },
  deliveryNoteRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryNote'
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
  items: [invoiceItemSchema],
  
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
  
  // Payment Details
  paidAmount: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid', 'overdue'],
    default: 'unpaid'
  },
  
  // Notes
  termsAndConditions: {
    type: String
  },
  notes: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'],
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

// Auto-generate invoice number
salesInvoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber || this.invoiceNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('SalesInvoice').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.invoiceNumber = `INV${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals and balance before saving
salesInvoiceSchema.pre('save', function(next) {
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
    this.balance = this.total - this.paidAmount;
    
    // Update payment status based on balance
    if (this.balance <= 0) {
      this.paymentStatus = 'paid';
    } else if (this.paidAmount > 0) {
      this.paymentStatus = 'partially_paid';
    } else if (this.dueDate < new Date()) {
      this.paymentStatus = 'overdue';
    } else {
      this.paymentStatus = 'unpaid';
    }
  }
  next();
});

// Additional indexes (unique fields already have indexes)
salesInvoiceSchema.index({ customer: 1 });
salesInvoiceSchema.index({ status: 1 });
salesInvoiceSchema.index({ paymentStatus: 1 });
salesInvoiceSchema.index({ invoiceDate: -1 });
salesInvoiceSchema.index({ dueDate: 1 });

module.exports = mongoose.model('SalesInvoice', salesInvoiceSchema);

