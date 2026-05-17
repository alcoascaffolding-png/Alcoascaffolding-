import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: { type: String, required: true, unique: true, trim: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true },
    vendorName: { type: String, required: true, trim: true },
    invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "PurchaseInvoice" }],
    paymentDate: { type: Date, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["Cash", "Cheque", "Bank Transfer", "Online", "Other"], default: "Cash" },
    bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount" },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

paymentSchema.index({ createdAt: -1 });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
