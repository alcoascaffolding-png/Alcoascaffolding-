/**
 * Journal Entry Model
 * Manual accounting entries
 */

const mongoose = require('mongoose');

const journalLineSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['asset', 'liability', 'equity', 'income', 'expense'],
    required: true
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  description: String
});

const journalEntrySchema = new mongoose.Schema({
  // Reference Information
  journalNumber: {
    type: String,
    required: true,
    unique: true
  },
  journalDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Entry Type
  entryType: {
    type: String,
    enum: ['opening', 'regular', 'adjustment', 'closing', 'reversal'],
    default: 'regular'
  },
  
  // Reference
  referenceNumber: String,
  
  // Journal Lines
  lines: {
    type: [journalLineSchema],
    validate: {
      validator: function(lines) {
        const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
        return Math.abs(totalDebit - totalCredit) < 0.01; // Allow small rounding differences
      },
      message: 'Total debits must equal total credits'
    }
  },
  
  // Totals
  totalDebit: {
    type: Number,
    default: 0
  },
  totalCredit: {
    type: Number,
    default: 0
  },
  
  // Notes
  description: String,
  notes: String,
  
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedDate: Date
  }],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'posted', 'reversed'],
    default: 'draft'
  },
  
  // Reversal tracking
  reversedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },
  reversalOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
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

// Auto-generate journal number
journalEntrySchema.pre('save', async function(next) {
  if (!this.journalNumber || this.journalNumber.startsWith('TEMP')) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('JournalEntry').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.journalNumber = `JE${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before saving
journalEntrySchema.pre('save', function(next) {
  if (this.lines && this.lines.length > 0) {
    this.totalDebit = this.lines.reduce((sum, line) => sum + line.debit, 0);
    this.totalCredit = this.lines.reduce((sum, line) => sum + line.credit, 0);
  }
  next();
});

// Additional indexes (unique fields already have indexes)
journalEntrySchema.index({ status: 1 });
journalEntrySchema.index({ entryType: 1 });
journalEntrySchema.index({ journalDate: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);

