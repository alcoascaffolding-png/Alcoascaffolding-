/**
 * Delivery Note Model
 * Delivery/dispatch documentation
 */

const mongoose = require('mongoose');

const deliveryItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  description: String,
  orderedQuantity: {
    type: Number,
    required: true
  },
  deliveredQuantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'pcs'
  },
  remarks: String
});

const deliveryNoteSchema = new mongoose.Schema({
  // Reference Information
  deliveryNoteNumber: {
    type: String,
    required: true,
    unique: true
  },
  deliveryDate: {
    type: Date,
    default: Date.now,
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
  
  // Delivery Address
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  
  // Items
  items: [deliveryItemSchema],
  
  // Delivery Details
  vehicleNumber: String,
  driverName: String,
  driverPhone: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Signature
  receivedBy: String,
  receivedDate: Date,
  signatureUrl: String,
  
  // Notes
  notes: String,
  
  // Invoicing
  invoiced: {
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

// Auto-generate delivery note number
deliveryNoteSchema.pre('save', async function(next) {
  if (!this.deliveryNoteNumber || this.deliveryNoteNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('DeliveryNote').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.deliveryNoteNumber = `DN${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Additional indexes (unique fields already have indexes)
deliveryNoteSchema.index({ customer: 1 });
deliveryNoteSchema.index({ status: 1 });
deliveryNoteSchema.index({ deliveryDate: -1 });

module.exports = mongoose.model('DeliveryNote', deliveryNoteSchema);

