export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { DeliveryNote } from "@/lib/mongoose-models";
import { prepareDeliveryNoteForPdf } from "@/lib/load-delivery-note-for-pdf";
import { resolveDocumentCustomerEmail } from "@/lib/resolve-document-customer";
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
  const note = await prepareDeliveryNoteForPdf(id);
  if (!note) throw new AppError("Delivery Note not found", 404);
  const toEmail = resolveDocumentCustomerEmail(note);
  if (!toEmail) {
    throw new AppError(
      "No customer email on this delivery note. Add an email on the note or on the linked customer record.",
      400
    );
  }
  const outbound = { ...note, customerEmail: toEmail };

  const pdfBuffer = await generateDeliveryNotePDF(outbound);
  const result = await sendDeliveryNoteEmail(outbound, pdfBuffer);

  await DeliveryNote.findByIdAndUpdate(id, {
    sentDate: new Date(),
    $push: {
      emailsSent: {
        sentAt: new Date(),
        sentTo: toEmail,
        subject: `Delivery Note ${note.deliveryNoteNumber}`,
        status: "sent",
      },
    },
  });

  return apiSuccess({ sent: true, messageId: result.messageId });
});
