import mongoose from "mongoose";

const contactPersonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
    role: { type: String, enum: ["primary", "site", "accounts", "other"], default: "other" },
  },
  { _id: true }
);

const addressSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["office", "billing", "site", "other"], default: "other" },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    area: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    emirate: {
      type: String,
      enum: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"],
      required: true,
    },
    country: { type: String, default: "UAE", trim: true },
    poBox: { type: String, trim: true },
    landmark: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true }
);

const customerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: [true, "Company name is required"], trim: true, index: true },
    displayName: { type: String, trim: true },
    tradeLicenseNumber: { type: String, trim: true, sparse: true, index: true },
    vatRegistrationNumber: { type: String, trim: true, sparse: true },
    businessType: {
      type: String,
      enum: ["Construction Company", "Contractor", "Facility Management", "Government", "Individual", "Other"],
      default: "Construction Company",
    },
    industry: { type: String, trim: true },
    website: { type: String, trim: true },
    contactPersons: [contactPersonSchema],
    addresses: [addressSchema],
    primaryEmail: { type: String, trim: true, lowercase: true, index: true },
    primaryPhone: { type: String, trim: true, index: true },
    primaryWhatsApp: { type: String, trim: true },
    paymentTerms: {
      type: String,
      enum: ["Cash", "7 Days", "15 Days", "30 Days", "45 Days", "60 Days", "Custom"],
      default: "Cash",
    },
    creditLimit: { type: Number, default: 0, min: 0 },
    currentBalance: { type: Number, default: 0 },
    currency: { type: String, default: "AED" },
    status: { type: String, enum: ["active", "inactive", "blocked", "prospect"], default: "prospect", index: true },
    customerType: { type: String, enum: ["rental", "sales", "both"], default: "both" },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    priority: { type: String, enum: ["low", "medium", "high", "vip"], default: "medium" },
    customerSince: { type: Date, default: Date.now },
    lastOrderDate: { type: Date },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    notes: { type: String, trim: true },
    internalNotes: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    referredBy: { type: String, trim: true },
    source: {
      type: String,
      enum: ["Website", "Phone Call", "Walk-in", "Referral", "Social Media", "Email", "Other"],
      default: "Website",
    },
    documents: [
      {
        type: { type: String, enum: ["Trade License", "VAT Certificate", "Emirates ID", "Contract", "Other"] },
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

customerSchema.index({ companyName: "text", primaryEmail: "text", primaryPhone: "text" });
customerSchema.index({ status: 1, customerType: 1 });
customerSchema.index({ createdAt: -1 });

customerSchema.virtual("primaryContact").get(function () {
  if (!this.contactPersons?.length) return null;
  return this.contactPersons.find((c) => c.isPrimary) || this.contactPersons[0];
});

customerSchema.virtual("primaryAddress").get(function () {
  if (!this.addresses?.length) return null;
  return this.addresses.find((a) => a.isPrimary) || this.addresses[0];
});

customerSchema.pre("save", function (next) {
  if (this.contactPersons?.length) {
    let found = false;
    this.contactPersons.forEach((c) => {
      if (c.isPrimary && !found) { found = true; }
      else if (c.isPrimary) { c.isPrimary = false; }
    });
    const primary = this.contactPersons.find((c) => c.isPrimary) || this.contactPersons[0];
    if (primary) {
      this.primaryEmail = primary.email;
      this.primaryPhone = primary.phone;
      this.primaryWhatsApp = primary.whatsapp || primary.phone;
    }
  }
  if (!this.displayName) this.displayName = this.companyName;
  next();
});

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);
