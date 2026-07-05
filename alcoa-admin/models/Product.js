import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ["Aluminium Scaffolding", "Steel Scaffolding", "Ladders", "Accessories", "Safety Equipment", "Other"],
      index: true,
    },
    unit: { type: String, default: "Nos", trim: true },
    sellingPrice: { type: Number, default: 0, min: 0 },
    rentalPrice: { type: Number, default: 0, min: 0 },
    purchasePrice: { type: Number, default: 0, min: 0 },
    currentStock: { type: Number, default: 0, index: true },
    minStock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },
    maxStock: { type: Number, default: 0 },
    preferredVendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true },
    specifications: { type: String, trim: true },
    dimensions: { type: String, trim: true },
    weight: { type: Number, min: 0 },
    imageUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", itemCode: "text", description: "text" });
productSchema.index({ category: 1, isActive: 1 });

/** Next.js dev hot-reload can keep an older compiled Product without new paths. */
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
if (!Product.schema.paths.preferredVendor) {
  Product.schema.add({
    preferredVendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true },
  });
}

export default Product;
