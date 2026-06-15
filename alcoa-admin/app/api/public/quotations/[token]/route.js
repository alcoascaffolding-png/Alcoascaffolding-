/**
 * Public, unauthenticated read for the customer-facing quotation page.
 * Looks up by `publicToken` and stamps `viewedDate` + status="viewed" once.
 */
import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Quotation from "@/models/Quotation";

export const runtime = "nodejs";

const PUBLIC_FIELDS = [
  "_id",
  "quoteNumber",
  "customerName",
  "customerAddress",
  "customerTRN",
  "customerEmail",
  "customerPhone",
  "quoteDate",
  "validUntil",
  "quoteType",
  "subject",
  "items",
  "subtotal",
  "deliveryCharges",
  "installationCharges",
  "discount",
  "discountType",
  "vatPercentage",
  "vatAmount",
  "totalAmount",
  "currency",
  "paymentTerms",
  "deliveryTerms",
  "notes",
  "termsAndConditions",
  "status",
  "viewedDate",
].join(" ");

export const GET = withErrorHandler(async (_request, { params }) => {
  await connectDB();
  const { token } = params;
  const q = await Quotation.findOne({ publicToken: token }).select(PUBLIC_FIELDS).lean();
  if (!q) throw new AppError("Quotation not found", 404);

  if (q.status === "sent") {
    await Quotation.updateOne(
      { publicToken: token, status: "sent" },
      { $set: { status: "viewed", viewedDate: new Date() } }
    );
    q.status = "viewed";
    q.viewedDate = new Date();
  }
  return apiSuccess(q);
});
