import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    vendorCode: { type: String, required: true, unique: true, trim: true, index: true },
    companyName: { type: String, required: true, trim: true, index: true },
    contactPerson: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    address: { type: String, trim: true },
    emirate: { type: String, trim: true },
    country: { type: String, default: "UAE", trim: true },
    tradeLicenseNumber: { type: String, trim: true },
    vatNumber: { type: String, trim: true },
    paymentTerms: { type: String, enum: ["Cash", "7 Days", "15 Days", "30 Days", "60 Days", "Custom"], default: "Cash" },
    creditLimit: { type: Number, default: 0, min: 0 },
    currentBalance: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive", "blocked"], default: "active", index: true },
    category: {
      type: String,
      enum: ["Supplier", "Manufacturer", "Distributor", "Service Provider", "Other"],
      default: "Supplier",
    },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

vendorSchema.index({ companyName: "text", email: "text" });
vendorSchema.index({ status: 1 });

export default mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
