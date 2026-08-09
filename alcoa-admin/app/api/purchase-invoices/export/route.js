import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";
import { formatDate } from "@/lib/utils";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const items = await PurchaseInvoice.find().sort({ createdAt: -1 }).lean();

  const rows = items.map((inv) => ({
    invoiceNumber: inv.invoiceNumber,
    vendorName: inv.vendorName,
    invoiceDate: formatDate(inv.invoiceDate),
    dueDate: inv.dueDate ? formatDate(inv.dueDate) : "",
    paymentStatus: inv.paymentStatus,
    total: inv.total || 0,
    balance: inv.balance ?? Math.max(0, (inv.total || 0) - (inv.paidAmount || 0)),
  }));

  const buffer = await exportToExcel("Purchase Invoices", EXPORT_COLUMNS["purchase-invoices"], rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="purchase-invoices-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
