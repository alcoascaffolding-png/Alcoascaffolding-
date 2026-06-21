import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { requireSession, requireManageUsers } from "@/lib/api-auth";
import User from "@/models/User";

async function resolveParams(context) {
  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  return params;
}

export const GET = withErrorHandler(async (request, context) => {
  const session = await requireSession();
  requireManageUsers(session);

  const params = await resolveParams(context);
  await connectDB();
  const user = await User.findById(params.id)
    .select("-password -refreshToken -passwordResetToken -passwordResetExpires")
    .lean();
  if (!user) throw new AppError("User not found", 404);
  return apiSuccess({ ...user, id: String(user._id) });
});

export const PATCH = withErrorHandler(async (request, context) => {
  const session = await requireSession();
  requireManageUsers(session);

  const params = await resolveParams(context);
  await connectDB();
  const body = await request.json();

  const user = await User.findById(params.id);
  if (!user) throw new AppError("User not found", 404);

  if (body.name != null) user.name = String(body.name).trim();
  if (body.email != null) {
    const email = String(body.email).toLowerCase().trim();
    const conflict = await User.findOne({ email, _id: { $ne: user._id } });
    if (conflict) throw new AppError("Email already in use", 409);
    user.email = email;
  }
  if (body.password) {
    if (String(body.password).length < 8) throw new AppError("Password must be at least 8 characters", 400);
    user.password = body.password;
  }
  if (body.role != null) user.role = body.role;
  if (body.department != null) user.department = body.department;
  if (body.phone !== undefined) user.phone = body.phone || undefined;
  if (body.isActive !== undefined) user.isActive = !!body.isActive;

  await user.save();
  return apiSuccess(user.getPublicProfile());
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await requireSession();
  requireManageUsers(session);

  const params = await resolveParams(context);
  if (String(params.id) === String(session.user.id)) {
    throw new AppError("You cannot delete your own account", 400);
  }

  await connectDB();
  const user = await User.findById(params.id);
  if (!user) throw new AppError("User not found", 404);

  if (user.role === "super_admin") {
    const otherSuper = await User.countDocuments({
      role: "super_admin",
      _id: { $ne: user._id },
      isActive: true,
    });
    if (otherSuper === 0) {
      throw new AppError("Cannot delete the last active super admin", 400);
    }
  }

  await user.deleteOne();
  return apiSuccess({ deleted: true });
});
