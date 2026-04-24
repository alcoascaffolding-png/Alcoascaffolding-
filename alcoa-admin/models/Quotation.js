import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema(
  {
    equipmentType: { type: String, required: true, trim: true },
    equipmentCode: { type: String, trim: true },
    description: { type: String, trim: true },
    specifications: { type: String, trim: true },
    size: { type: String, trim: true },
    weight: { type: Number, min: 0 },
    cbm: { type: Number, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: "Nos", trim: true },
    rentalDuration: {
      value: Number,
      unit: { type: String, enum: ["day", "week", "month"], default: "day" },
    },
    ratePerUnit: { type: Number, required: true, min: 0 },
    taxableAmount: { type: Number, min: 0 },
    vatPercentage: { type: Number, default: 5, min: 0 },
    vatAmount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    itemImage: { type: String, trim: true },
  },
  { _id: true }
);

const quotationSchema = new mongoose.Schema(
  {
    quoteNumber: { type: String, required: true, unique: true, trim: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerAddress: { type: String, trim: true },
    customerEmail: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    customerTRN: { type: String, trim: true },
    contactPersonName: { type: String, trim: true },
    contactPersonDesignation: { type: String, trim: true },
    contactPersonEmail: { type: String, trim: true },
    contactPersonPhone: { type: String, trim: true },
    quoteDate: { type: Date, default: Date.now, index: true },
    validUntil: { type: Date, required: true, index: true },
    quoteType: { type: String, enum: ["rental", "sales", "service", "both"], default: "rental", index: true },
    status: {
      type: String,
      enum: ["draft", "sent", "viewed", "approved", "rejected", "expired", "converted"],
      default: "draft",
      index: true,
    },
    subject: { type: String, trim: true },
    salesExecutive: { type: String, trim: true },
    preparedBy: { type: String, trim: true },
    customerPONumber: { type: String, trim: true },
    referenceNumber: { type: String, trim: true },
    paymentTerms: { type: String, default: "Cash/CDC", trim: true },
    deliveryTerms: { type: String, default: "7-10 days from date of order", trim: true },
    projectDuration: { type: String, trim: true },
    items: [quotationItemSchema],
    subtotal: { type: Number, required: true, default: 0, min: 0 },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    installationCharges: { type: Number, default: 0, min: 0 },
    pickupCharges: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "fixed" },
    vatPercentage: { type: Number, default: 5, min: 0, max: 100 },
    vatAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, default: "AED" },
    deliveryAddress: {
      addressLine1: String,
      addressLine2: String,
      area: String,
      city: String,
      emirate: String,
      landmark: String,
    },
    deliveryDate: { type: Date },
    notes: { type: String, trim: true },
    internalNotes: { type: String, trim: true },
    termsAndConditions: { type: String, trim: true },
    sentDate: { type: Date },
    viewedDate: { type: Date },
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
    followUpDate: { type: Date },
    followUpNotes: { type: String, trim: true },
    convertedToOrder: { type: Boolean, default: false },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "RentalOrder" },
    convertedAt: { type: Date },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Bank details for PDF
    bankDetails: {
      bankName: { type: String, trim: true },
      accountName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      iban: { type: String, trim: true },
      swiftCode: { type: String, trim: true },
      branch: { type: String, trim: true },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

quotationSchema.index({ quoteNumber: "text", customerName: "text" });
quotationSchema.index({ status: 1, quoteDate: -1 });
quotationSchema.index({ customer: 1, status: 1 });
quotationSchema.index({ validUntil: 1 });
quotationSchema.index({ createdAt: -1 });

quotationSchema.virtual("isExpired").get(function () {
  return this.validUntil < new Date() && !["approved", "converted"].includes(this.status);
});

quotationSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  let beforeVAT = this.subtotal + (this.deliveryCharges || 0) + (this.installationCharges || 0) + (this.pickupCharges || 0);
  if (this.discount > 0) {
    beforeVAT -= this.discountType === "percentage" ? (beforeVAT * this.discount) / 100 : this.discount;
  }
  this.vatAmount = (beforeVAT * this.vatPercentage) / 100;
  this.totalAmount = beforeVAT + this.vatAmount;
  return this.totalAmount;
};

quotationSchema.statics.generateQuoteNumber = async function () {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;
  const last = await this.findOne({ quoteNumber: new RegExp(`^${prefix}`) }).sort({ quoteNumber: -1 });
  const number = last ? parseInt(last.quoteNumber.split("-")[2]) + 1 : 1;
  return `${prefix}${String(number).padStart(4, "0")}`;
};

quotationSchema.pre("save", function (next) {
  if (this.items?.length) this.calculateTotals();
  if (this.validUntil < new Date() && this.status === "sent") this.status = "expired";
  next();
});

export default mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);
