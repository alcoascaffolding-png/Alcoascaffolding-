export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import SalesOrder from "@/models/SalesOrder";
import { generateSalesOrderPDF } from "@/lib/pdf/sales-document-pdf";

export const GET = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const routeParams =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  const id = routeParams?.id;
  if (!id) return apiError("Missing id", 400);

  await connectDB();
  const order = await SalesOrder.findById(id).lean();
  if (!order) throw new AppError("Sales Order not found", 404);

  const pdfBuffer = await generateSalesOrderPDF(order);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.orderNumber}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
});
