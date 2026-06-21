import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { requireSession, requireManageUsers } from "@/lib/api-auth";
import User from "@/models/User";

export const GET = withErrorHandler(async () => {
  const session = await requireSession();
  requireManageUsers(session);

  await connectDB();
  const total = await User.countDocuments();
  const active = await User.countDocuments({ isActive: true });
  return apiSuccess({ total, active });
});
