import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import ContactMessage from "@/models/ContactMessage";

export const GET = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const msg = await ContactMessage.findById(params.id).lean();
  if (!msg) throw new AppError("Message not found", 404);

  // Mark as read
  if (msg.status === "new") {
    await ContactMessage.findByIdAndUpdate(params.id, { status: "read" });
  }

  return apiSuccess(msg);
});

export const PATCH = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();

  // Allowed fields to update
  const allowed = ["status", "priority", "adminNotes", "assignedTo"];
  const update = {};
  allowed.forEach((k) => { if (body[k] !== undefined) update[k] = body[k]; });

  if (body.status === "responded") {
    update.respondedAt = new Date();
    update.respondedBy = session.user.id;
  }

  const msg = await ContactMessage.findByIdAndUpdate(params.id, update, { new: true, runValidators: true });
  if (!msg) throw new AppError("Message not found", 404);

  return apiSuccess(msg);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const msg = await ContactMessage.findByIdAndDelete(params.id);
  if (!msg) throw new AppError("Message not found", 404);

  return apiSuccess({ deleted: true });
});
