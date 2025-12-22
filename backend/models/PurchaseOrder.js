/**
 * Purchase Order Model
 * Purchase orders to vendors
 */

const mongoose = require('mongoose');

const purchaseOrderItemSchema = new mongoose.Schema({
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
  },
  receivedQuantity: {
    type: Number,
    default: 0
  },
  invoicedQuantity: {
    type: Number,
    default: 0
  }
});

const purchaseOrderSchema = new mongoose.Schema({
  // Reference Information
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  poDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  expectedDeliveryDate: {
    type: Date
  },
  
  // Vendor Information
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: String,
  
  // Delivery Address
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  
  // Items
  items: [purchaseOrderItemSchema],
  
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
  termsAndConditions: String,
  notes: String,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'confirmed', 'partially_received', 'received', 'partially_invoiced', 'invoiced', 'cancelled'],
    default: 'draft'
  },
  
  // Approval
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  approvalNotes: String,
  
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

// Auto-generate PO number
purchaseOrderSchema.pre('save', async function(next) {
  if (!this.poNumber || this.poNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('PurchaseOrder').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.poNumber = `PO${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before saving
purchaseOrderSchema.pre('save', function(next) {
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
purchaseOrderSchema.index({ vendor: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ poDate: -1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);

