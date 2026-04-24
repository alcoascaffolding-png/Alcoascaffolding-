import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import ContactMessage from "@/models/ContactMessage";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const stats = await ContactMessage.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        newMessages: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
        contactCount: { $sum: { $cond: [{ $eq: ["$type", "contact"] }, 1, 0] } },
        quoteCount: { $sum: { $cond: [{ $eq: ["$type", "quote"] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] } },
      },
    },
  ]);

  return apiSuccess(stats[0] || { total: 0, newMessages: 0, inProgress: 0, contactCount: 0, quoteCount: 0, urgent: 0 });
});
