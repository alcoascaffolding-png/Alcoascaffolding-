import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    equipmentType: { type: String, trim: true },
    specifications: { type: String, trim: true },
    size: { type: String, trim: true },
    weight: { type: Number, min: 0 },
    cbm: { type: Number, min: 0 },
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
    customerAddress: { type: String, trim: true },
    customerEmail: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    customerTRN: { type: String, trim: true },
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

/** @param {Date|string|number} [baseDate] */
salesInvoiceSchema.statics.generateInvoiceNumber = async function generateInvoiceNumber(
  baseDate = new Date()
) {
  const { generateNewDocumentNumber, DOCUMENT_PREFIX } = await import("@/lib/document-number");
  const Quotation = (await import("@/models/Quotation")).default;
  const SalesOrder = (await import("@/models/SalesOrder")).default;
  return generateNewDocumentNumber(
    { Quotation, SalesOrder, SalesInvoice: this },
    DOCUMENT_PREFIX.SALES_INVOICE,
    baseDate
  );
};

export default mongoose.models.SalesInvoice || mongoose.model("SalesInvoice", salesInvoiceSchema);
