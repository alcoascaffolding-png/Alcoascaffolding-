import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    accountName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, unique: true, trim: true },
    iban: { type: String, trim: true },
    swiftCode: { type: String, trim: true },
    branch: { type: String, trim: true },
    currency: { type: String, default: "AED" },
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.BankAccount || mongoose.model("BankAccount", bankAccountSchema);
