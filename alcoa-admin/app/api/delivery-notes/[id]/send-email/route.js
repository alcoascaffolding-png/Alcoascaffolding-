export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import DeliveryNote from "@/models/DeliveryNote";
import { generateDeliveryNotePDF } from "@/lib/pdf/delivery-note-pdf";
import { sendDeliveryNoteEmail } from "@/lib/email/resend";

export const POST = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const routeParams =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  const id = routeParams?.id;
  if (!id) return apiError("Missing id", 400);

  await connectDB();
  const note = await DeliveryNote.findById(id)
    .populate("salesOrder", "orderNumber")
    .lean();
  if (!note) throw new AppError("Delivery Note not found", 404);
  if (!note.customerEmail) throw new AppError("Delivery note has no customer email", 400);

  const pdfBuffer = await generateDeliveryNotePDF(note);
  const result = await sendDeliveryNoteEmail(note, pdfBuffer);

  await DeliveryNote.findByIdAndUpdate(id, {
    sentDate: new Date(),
    $push: {
      emailsSent: {
        sentAt: new Date(),
        sentTo: note.customerEmail,
        subject: `Delivery Note ${note.deliveryNoteNumber}`,
        status: "sent",
      },
    },
  });

  return apiSuccess({ sent: true, messageId: result.messageId });
});
