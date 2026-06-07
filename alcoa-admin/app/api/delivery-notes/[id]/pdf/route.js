export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { DeliveryNote } from "@/lib/mongoose-models";
import { generateDeliveryNotePDF } from "@/lib/pdf/delivery-note-pdf";

export const GET = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const note = await DeliveryNote.findById(params.id)
    .populate("salesOrder", "orderNumber")
    .lean();
  if (!note) throw new AppError("Delivery Note not found", 404);

  const pdfBuffer = await generateDeliveryNotePDF(note);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${note.deliveryNoteNumber}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
});
