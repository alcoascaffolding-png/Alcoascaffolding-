import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Quotation from "@/models/Quotation";

export const runtime = "nodejs";

const TERMINAL = new Set(["approved", "rejected", "converted"]);

export const POST = withErrorHandler(async (request, { params }) => {
  await connectDB();
  const { token } = params;

  const body = await request.json().catch(() => ({}));
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : "";

  const doc = await Quotation.findOne({ publicToken: token });
  if (!doc) throw new AppError("Quotation not found", 404);

  if (TERMINAL.has(doc.status)) {
    return apiSuccess({ alreadyDecided: true, status: doc.status });
  }

  doc.status = "rejected";
  if (note) {
    doc.followUpNotes = `${doc.followUpNotes ? doc.followUpNotes + "\n\n" : ""}Customer rejection note: ${note}`;
  }
  await doc.save();
  return apiSuccess({ status: doc.status });
});
