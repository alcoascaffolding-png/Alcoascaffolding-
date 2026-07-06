import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    /** Normalized key for uniqueness checks (lowercase, trimmed) */
    nameKey: { type: String, required: true, trim: true, lowercase: true },
    type: { type: String, enum: ["product", "vendor"], required: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    description: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

categorySchema.index({ type: 1, nameKey: 1 }, { unique: true });
categorySchema.index({ type: 1, isActive: 1, sortOrder: 1 });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
