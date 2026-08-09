import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Receipt from "@/models/Receipt";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";
import { formatDate } from "@/lib/utils";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const items = await Receipt.find().sort({ createdAt: -1 }).lean();

  const rows = items.map((r) => ({
    receiptNumber: r.receiptNumber,
    customerName: r.customerName,
    receiptDate: formatDate(r.receiptDate),
    paymentMethod: r.paymentMethod,
    reference: r.reference || "",
    amount: r.amount || 0,
  }));

  const buffer = await exportToExcel("Receipts", EXPORT_COLUMNS.receipts, rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="receipts-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
