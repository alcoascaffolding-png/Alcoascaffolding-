import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { logAudit } from "@/lib/audit-log";
import ContactMessage from "@/models/ContactMessage";

export const GET = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("contact-messages", "read");

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
  const session = await authorizeApi("contact-messages", "write");

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

  logAudit({
    session,
    action: "update",
    resource: "contact-messages",
    resourceId: msg._id,
    summary: `Updated contact message from ${msg.name || msg.email || msg._id}`,
  });

  return apiSuccess(msg);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("contact-messages", "delete");

  await connectDB();
  const msg = await ContactMessage.findByIdAndDelete(params.id);
  if (!msg) throw new AppError("Message not found", 404);

  logAudit({
    session,
    action: "delete",
    resource: "contact-messages",
    resourceId: msg._id,
    summary: `Deleted contact message from ${msg.name || msg.email || msg._id}`,
  });

  return apiSuccess({ deleted: true });
});
