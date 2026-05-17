import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Quotation from "@/models/Quotation";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";
import { formatDate } from "@/lib/utils";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const quotations = await Quotation.find().sort({ createdAt: -1 }).lean();

  const rows = quotations.map((q) => ({
    quoteNumber: q.quoteNumber,
    customerName: q.customerName,
    quoteDate: formatDate(q.quoteDate),
    validUntil: formatDate(q.validUntil),
    quoteType: q.quoteType,
    status: q.status,
    totalAmount: q.totalAmount || 0,
    salesExecutive: q.salesExecutive || "",
  }));

  const buffer = await exportToExcel("Quotations", EXPORT_COLUMNS.quotations, rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="quotations-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
