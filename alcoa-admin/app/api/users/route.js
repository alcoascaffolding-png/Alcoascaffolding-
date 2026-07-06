import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { requireSession, requireManageUsers } from "@/lib/api-auth";
import User from "@/models/User";
import { validatePasswordForSet } from "@/lib/schemas/password";

export const GET = withErrorHandler(async () => {
  const session = await requireSession();
  requireManageUsers(session);

  await connectDB();
  const users = await User.find()
    .select("-password -refreshToken -passwordResetToken -passwordResetExpires")
    .sort({ createdAt: -1 })
    .lean();

  return apiSuccess({
    items: users.map((u) => ({
      ...u,
      id: String(u._id),
    })),
    total: users.length,
  });
});

export const POST = withErrorHandler(async (request) => {
  const session = await requireSession();
  requireManageUsers(session);

  await connectDB();
  const body = await request.json();

  if (!body.name?.trim()) throw new AppError("Name is required", 400);
  if (!body.email?.trim()) throw new AppError("Email is required", 400);
  const passwordCheck = validatePasswordForSet(body.password);
  if (!passwordCheck.ok) throw new AppError(passwordCheck.message, 400);

  const existing = await User.findOne({ email: String(body.email).toLowerCase().trim() });
  if (existing) throw new AppError("Email already in use", 409);

  const user = await User.create({
    name: body.name.trim(),
    email: String(body.email).toLowerCase().trim(),
    password: body.password,
    role: body.role || "viewer",
    department: body.department || "operations",
    phone: body.phone || undefined,
    isActive: body.isActive !== false,
  });

  return apiSuccess(user.getPublicProfile(), 201);
});
