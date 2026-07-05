import mongoose from "mongoose";

const userNotificationStateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    dismissedIds: { type: [String], default: [] },
    readIds: { type: [String], default: [] },
    lastSeenAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.UserNotificationState
  || mongoose.model("UserNotificationState", userNotificationStateSchema);
