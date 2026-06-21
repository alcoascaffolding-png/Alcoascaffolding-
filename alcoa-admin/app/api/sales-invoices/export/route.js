import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import SalesInvoice from "@/models/SalesInvoice";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";
import { formatDate } from "@/lib/utils";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const items = await SalesInvoice.find().sort({ createdAt: -1 }).lean();

  const rows = items.map((inv) => ({
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customerName,
    invoiceDate: formatDate(inv.invoiceDate),
    paymentStatus: inv.paymentStatus,
    total: inv.total || 0,
    balance: inv.balance ?? Math.max(0, (inv.total || 0) - (inv.paidAmount || 0)),
  }));

  const buffer = await exportToExcel("Tax Invoices", EXPORT_COLUMNS["sales-invoices"], rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="tax-invoices-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
