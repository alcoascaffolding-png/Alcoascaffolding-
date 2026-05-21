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
      enum: [
        "draft",
        "confirmed",
        "in_progress",
        "delivered",
        "completed",
        "invoiced",
        "cancelled",
      ],
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

/** @param {Date|string|number} [baseDate] */
salesOrderSchema.statics.generateOrderNumber = async function generateOrderNumber(baseDate = new Date()) {
  const { generateNewDocumentNumber, DOCUMENT_PREFIX } = await import("@/lib/document-number");
  const Quotation = (await import("@/models/Quotation")).default;
  const SalesInvoice = (await import("@/models/SalesInvoice")).default;
  return generateNewDocumentNumber(
    { Quotation, SalesOrder: this, SalesInvoice },
    DOCUMENT_PREFIX.SALES_ORDER,
    baseDate
  );
};

/** Re-register so enum changes (e.g. `invoiced`) apply under Next.js hot reload. */
if (mongoose.models.SalesOrder) {
  delete mongoose.models.SalesOrder;
}

export default mongoose.model("SalesOrder", salesOrderSchema);

export const SALES_ORDER_STATUS_VALUES = [
  "draft",
  "confirmed",
  "in_progress",
  "delivered",
  "completed",
  "invoiced",
  "cancelled",
];
