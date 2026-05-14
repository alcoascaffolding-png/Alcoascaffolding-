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

const salesOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    status: {
      type: String,
      enum: ["draft", "confirmed", "in_progress", "delivered", "completed", "cancelled"],
      default: "draft",
      index: true,
    },
    items: [lineItemSchema],
    subtotal: { type: Number, default: 0, min: 0 },
    vatAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
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

salesOrderSchema.index({ customerName: "text", orderNumber: "text" });
salesOrderSchema.index({ status: 1, orderDate: -1 });
salesOrderSchema.index({ createdAt: -1 });

salesOrderSchema.methods.recalculateTotals = function recalculateTotals() {
  const sub = (this.items || []).reduce((sum, row) => sum + Number(row.total || 0), 0);
  this.subtotal = sub;
  this.total = sub + Number(this.vatAmount || 0);
  return this.total;
};

salesOrderSchema.pre("save", function (next) {
  if (this.items?.length) this.recalculateTotals();
  next();
});

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

salesOrderSchema.statics.generateOrderNumber = async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prefix = `SO-${year}-`;
  const last = await this.findOne({ orderNumber: new RegExp(`^${escapeRegex(prefix)}`) })
    .sort({ orderNumber: -1 })
    .select("orderNumber")
    .lean();
  const n = last ? parseInt(String(last.orderNumber).split("-")[2], 10) + 1 : 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
};

export default mongoose.models.SalesOrder || mongoose.model("SalesOrder", salesOrderSchema);
