import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "Nos", trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const salesInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: "SalesOrder" },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid", "overdue", "cancelled"],
      default: "unpaid",
      index: true,
    },
    items: [lineItemSchema],
    subtotal: { type: Number, default: 0, min: 0 },
    vatAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "AED" },
    notes: { type: String, trim: true },
    sentDate: { type: Date },
    emailsSent: [
      {
        sentAt: Date,
        sentTo: String,
        subject: String,
        status: { type: String, enum: ["sent", "failed", "bounced"] },
      },
    ],
    whatsappSent: [
      {
        sentAt: Date,
        sentTo: String,
        messageSid: String,
        status: { type: String, enum: ["sent", "failed", "delivered", "read"] },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

salesInvoiceSchema.index({ customerName: "text", invoiceNumber: "text" });
salesInvoiceSchema.index({ paymentStatus: 1, dueDate: 1 });
salesInvoiceSchema.index({ createdAt: -1 });

salesInvoiceSchema.methods.recalculateTotals = function recalculateTotals() {
  const sub = (this.items || []).reduce((sum, row) => sum + Number(row.total || 0), 0);
  this.subtotal = sub;
  const gross = sub + Number(this.vatAmount || 0);
  this.total = gross;
  this.balance = Math.max(0, gross - Number(this.paidAmount || 0));
  return this.total;
};

salesInvoiceSchema.pre("save", function (next) {
  if (this.items?.length) this.recalculateTotals();
  next();
});

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

salesInvoiceSchema.statics.generateInvoiceNumber = async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const last = await this.findOne({ invoiceNumber: new RegExp(`^${escapeRegex(prefix)}`) })
    .sort({ invoiceNumber: -1 })
    .select("invoiceNumber")
    .lean();
  const n = last ? parseInt(String(last.invoiceNumber).split("-")[2], 10) + 1 : 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
};

export default mongoose.models.SalesInvoice || mongoose.model("SalesInvoice", salesInvoiceSchema);
