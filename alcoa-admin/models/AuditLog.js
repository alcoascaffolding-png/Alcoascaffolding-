import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    userEmail: { type: String, trim: true },
    action: {
      type: String,
      enum: ["create", "update", "delete", "status_change", "send_email", "send_whatsapp"],
      required: true,
      index: true,
    },
    resource: { type: String, required: true, trim: true, index: true },
    resourceId: { type: String, trim: true, index: true },
    summary: { type: String, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
