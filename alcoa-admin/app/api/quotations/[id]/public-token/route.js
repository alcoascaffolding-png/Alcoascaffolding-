/**
 * Auth-required endpoint to mint (idempotent) a public share token for a quotation.
 * Used by the admin "Public link" badge so staff can copy/share the customer URL.
 */
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Quotation from "@/models/Quotation";
import { ensureQuotationPublicToken } from "@/lib/quotation-save";

export const runtime = "nodejs";

export const POST = withErrorHandler(async (_request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const { token, url } = await ensureQuotationPublicToken(params.id, Quotation);
  return apiSuccess({ token, url });
});
