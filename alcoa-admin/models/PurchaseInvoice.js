import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "Nos", trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const purchaseInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true },
    vendorName: { type: String, required: true, trim: true },
    purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder" },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paymentStatus: { type: String, enum: ["unpaid", "partially_paid", "paid", "overdue"], default: "unpaid", index: true },
    items: [lineItemSchema],
    subtotal: { type: Number, default: 0, min: 0 },
    vatAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "AED" },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

purchaseInvoiceSchema.index({ createdAt: -1 });

export default mongoose.models.PurchaseInvoice || mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);
