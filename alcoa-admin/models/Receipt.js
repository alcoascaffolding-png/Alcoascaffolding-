import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true, trim: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true },
    customerName: { type: String, required: true, trim: true },
    invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice" }],
    receiptDate: { type: Date, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["Cash", "Cheque", "Bank Transfer", "Online", "Other"], default: "Cash" },
    bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount" },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

receiptSchema.index({ createdAt: -1 });

export default mongoose.models.Receipt || mongoose.model("Receipt", receiptSchema);
