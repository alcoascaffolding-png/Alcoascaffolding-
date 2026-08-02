export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { generateLetterheadPDF } from "@/lib/pdf/letterhead-pdf";

function readOptions(searchParams) {
  return {
    body: searchParams.get("body") || "",
    pages: Number(searchParams.get("pages") || 1),
    watermark: searchParams.get("watermark") === "1",
  };
}

async function respondWithLetterhead(options) {
  const pdfBuffer = await generateLetterheadPDF(options);
  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="letterhead.pdf"',
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}

export const GET = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  return respondWithLetterhead(readOptions(searchParams));
});

export const POST = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const body = await request.json().catch(() => ({}));
  return respondWithLetterhead({
    body: typeof body.body === "string" ? body.body : "",
    pages: Number(body.pages || 1),
    watermark: Boolean(body.watermark),
  });
});
