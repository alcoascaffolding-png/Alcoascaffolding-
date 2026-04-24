import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import User from "@/models/User";

export const POST = withErrorHandler(async (request) => {
  // Guard with SETUP_SECRET header
  const setupSecret = process.env.SETUP_SECRET;
  if (setupSecret) {
    const provided = request.headers.get("x-setup-secret");
    if (provided !== setupSecret) {
      return apiError("Forbidden — invalid setup secret", 403);
    }
  }

  await connectDB();

  // Prevent re-creation if admin already exists
  const existing = await User.findOne({ role: { $in: ["super_admin", "admin"] } });
  if (existing) {
    return apiError("An admin user already exists. Use /api/setup/status to check.", 409);
  }

  const body = await request.json();

  const admin = await User.create({
    name: body.name || "Admin",
    email: body.email || "admin@alcoascaffolding.com",
    password: body.password || "Admin@1234",
    role: "super_admin",
    isActive: true,
  });

  return apiSuccess({
    message: "Admin user created successfully.",
    email: admin.email,
    role: admin.role,
  }, 201);
});

export const GET = withErrorHandler(async (request) => {
  const setupSecret = process.env.SETUP_SECRET;
  if (setupSecret) {
    const provided = request.headers.get("x-setup-secret");
    if (provided !== setupSecret) return apiError("Forbidden", 403);
  }

  await connectDB();
  const adminExists = await User.exists({ role: { $in: ["super_admin", "admin"] } });
  return apiSuccess({ adminExists: !!adminExists });
});
