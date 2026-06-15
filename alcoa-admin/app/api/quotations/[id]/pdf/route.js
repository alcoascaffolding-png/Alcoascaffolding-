export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { prepareQuotationForPdf } from "@/lib/load-quotation-for-pdf";
import { generateQuotationPDF } from "@/lib/pdf/quotation-pdf";

export const GET = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const quotation = await prepareQuotationForPdf(params.id);
  if (!quotation) throw new AppError("Quotation not found", 404);

  const pdfBuffer = await generateQuotationPDF(quotation);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quotation.quoteNumber}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
});
