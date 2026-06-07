import mongoose from "mongoose";

const deliveryLineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    equipmentType: { type: String, trim: true },
    specifications: { type: String, trim: true },
    size: { type: String, trim: true },
    weight: { type: Number, min: 0, default: 0 },
    cbm: { type: Number, min: 0, default: 0 },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "Nos", trim: true },
  },
  { _id: true }
);

const deliveryNoteSchema = new mongoose.Schema(
  {
    deliveryNoteNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    customerAddress: { type: String, trim: true },
    salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: "SalesOrder", index: true },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
    deliveryDate: { type: Date },
    deliveryAddress: { type: String, trim: true },
    driverName: { type: String, trim: true },
    vehicleNumber: { type: String, trim: true },
    contactPersonName: { type: String, trim: true },
    contactPersonPhone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["draft", "ready", "dispatched", "in_transit", "delivered", "cancelled"],
      default: "draft",
      index: true,
    },
    items: [deliveryLineItemSchema],
    notes: { type: String, trim: true },
    deliveryInstructions: { type: String, trim: true },
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

deliveryNoteSchema.index({ customerName: "text", deliveryNoteNumber: "text" });
deliveryNoteSchema.index({ status: 1, deliveryDate: -1 });
deliveryNoteSchema.index({ createdAt: -1 });

/** @param {Date|string|number} [baseDate] */
deliveryNoteSchema.statics.generateDeliveryNoteNumber = async function generateDeliveryNoteNumber(
  baseDate = new Date()
) {
  const { generateNewDocumentNumber, DOCUMENT_PREFIX } = await import("@/lib/document-number");
  const Quotation = (await import("@/models/Quotation")).default;
  const SalesOrder = (await import("@/models/SalesOrder")).default;
  const SalesInvoice = (await import("@/models/SalesInvoice")).default;
  return generateNewDocumentNumber(
    { Quotation, SalesOrder, SalesInvoice, DeliveryNote: this },
    DOCUMENT_PREFIX.DELIVERY_NOTE,
    baseDate
  );
};

if (mongoose.models.DeliveryNote) {
  delete mongoose.models.DeliveryNote;
}

export default mongoose.model("DeliveryNote", deliveryNoteSchema);

export const DELIVERY_NOTE_STATUS_VALUES = [
  "draft",
  "ready",
  "dispatched",
  "in_transit",
  "delivered",
  "cancelled",
];
