/**
 * ContactMessage Model
 * Stores all contact form and quote request submissions
 */

const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  // Message Type
  type: {
    type: String,
    enum: ['contact', 'quote'],
    required: true
  },
  
  // Contact Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  
  // Project Information
  projectType: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'emergency', 'rental', 'consultation', ''],
    default: ''
  },
  message: {
    type: String,
    trim: true
  },
  
  // Quote Specific Fields
  projectHeight: {
    type: String,
    trim: true
  },
  coverageArea: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  startDate: {
    type: String,
    trim: true
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['new', 'read', 'in_progress', 'responded', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Notes and Follow-up
  adminNotes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Email Metadata
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  
  // Tracking
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  
  // Metadata
  respondedAt: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
contactMessageSchema.index({ type: 1, status: 1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);

