import mongoose from "mongoose";

const stockAdjustmentSchema = new mongoose.Schema(
  {
    adjustmentNumber: { type: String, required: true, unique: true, trim: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productName: { type: String, required: true, trim: true },
    adjustmentType: { type: String, enum: ["increase", "decrease", "correction"], required: true },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
    adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

stockAdjustmentSchema.index({ createdAt: -1 });

export default mongoose.models.StockAdjustment || mongoose.model("StockAdjustment", stockAdjustmentSchema);
