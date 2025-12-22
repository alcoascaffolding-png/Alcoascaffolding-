/**
 * Sales Order Model
 * Customer purchase orders
 */

const mongoose = require('mongoose');

const salesOrderItemSchema = new mongoose.Schema({
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
  },
  deliveredQuantity: {
    type: Number,
    default: 0
  },
  invoicedQuantity: {
    type: Number,
    default: 0
  }
});

const salesOrderSchema = new mongoose.Schema({
  // Reference Information
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  orderDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  expectedDeliveryDate: {
    type: Date
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
  customerPONumber: {
    type: String
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
  items: [salesOrderItemSchema],
  
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
  paymentTerms: {
    type: String,
    default: 'Net 30'
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
    enum: ['draft', 'confirmed', 'in_progress', 'partially_delivered', 'delivered', 'partially_invoiced', 'invoiced', 'cancelled'],
    default: 'draft'
  },
  
  // Fulfillment tracking
  fulfilmentStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
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

// Auto-generate order number
salesOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber || this.orderNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('SalesOrder').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.orderNumber = `SO${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before saving
salesOrderSchema.pre('save', function(next) {
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
  }
  next();
});

// Additional indexes (unique fields already have indexes)
salesOrderSchema.index({ customer: 1 });
salesOrderSchema.index({ status: 1 });
salesOrderSchema.index({ orderDate: -1 });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);

