import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["contact", "quote"], required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    projectType: {
      type: String,
      enum: ["residential", "commercial", "industrial", "emergency", "rental", "consultation", ""],
      default: "",
    },
    message: { type: String, trim: true },
    projectHeight: { type: String, trim: true },
    coverageArea: { type: String, trim: true },
    duration: { type: String, trim: true },
    startDate: { type: String, trim: true },
    status: {
      type: String,
      enum: ["new", "read", "in_progress", "responded", "closed"],
      default: "new",
    },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    adminNotes: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    ipAddress: { type: String },
    userAgent: { type: String },
    respondedAt: { type: Date },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

contactMessageSchema.index({ type: 1, status: 1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1, priority: 1 });

export default mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);
