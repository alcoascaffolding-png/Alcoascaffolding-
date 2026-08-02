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

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true, trim: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true },
    vendorName: { type: String, required: true, trim: true },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    status: {
      type: String,
      enum: ["draft", "sent", "confirmed", "partially_received", "received", "cancelled"],
      default: "draft",
      index: true,
    },
    items: [lineItemSchema],
    subtotal: { type: Number, default: 0, min: 0 },
    vatAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "AED" },
    /** Printed on the LPO; blank falls back to the vendor's agreed terms. */
    paymentTerms: { type: String, trim: true },
    deliveryAddress: { type: String, trim: true },
    /** Blank prints the standard LPO terms from lib/pdf/purchase-order-terms.js. */
    termsAndConditions: { type: String, trim: true },
    notes: { type: String, trim: true },
    /** True after inbound stock was increased for status received */
    stockApplied: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ createdAt: -1 });

export default mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", purchaseOrderSchema);
