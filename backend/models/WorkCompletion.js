/**
 * Work Completion Model
 * Project/work completion certificates
 */

const mongoose = require('mongoose');

const workItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  description: String,
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'pcs'
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'in_progress'],
    default: 'completed'
  },
  remarks: String
});

const workCompletionSchema = new mongoose.Schema({
  // Reference Information
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  completionDate: {
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
  
  // Project Information
  projectName: {
    type: String,
    required: true
  },
  projectLocation: String,
  projectDescription: String,
  
  // Reference Documents
  salesOrderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  },
  
  // Work Details
  workStartDate: {
    type: Date,
    required: true
  },
  workEndDate: {
    type: Date,
    required: true
  },
  
  // Items/Services Completed
  items: [workItemSchema],
  
  // Quality & Safety
  qualityCheckStatus: {
    type: String,
    enum: ['passed', 'failed', 'pending'],
    default: 'pending'
  },
  safetyCheckStatus: {
    type: String,
    enum: ['passed', 'failed', 'pending'],
    default: 'pending'
  },
  
  // Certification
  certifiedBy: {
    type: String
  },
  certificationAuthority: String,
  certificationDate: Date,
  
  // Customer Acceptance
  acceptedBy: String,
  acceptanceDate: Date,
  customerSignature: String,
  customerRemarks: String,
  
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedDate: Date
  }],
  
  // Photos
  photos: [{
    photoUrl: String,
    caption: String,
    uploadedDate: Date
  }],
  
  // Notes
  notes: String,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'in_review', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },
  
  // Invoice Generation
  invoiceGenerated: {
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

// Auto-generate certificate number
workCompletionSchema.pre('save', async function(next) {
  if (!this.certificateNumber || this.certificateNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('WorkCompletion').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.certificateNumber = `WC${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Additional indexes (unique fields already have indexes)
workCompletionSchema.index({ customer: 1 });
workCompletionSchema.index({ status: 1 });
workCompletionSchema.index({ completionDate: -1 });

module.exports = mongoose.model('WorkCompletion', workCompletionSchema);

