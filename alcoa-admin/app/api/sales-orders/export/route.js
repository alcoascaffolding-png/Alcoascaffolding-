import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import SalesOrder from "@/models/SalesOrder";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";
import { formatDate } from "@/lib/utils";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const items = await SalesOrder.find().sort({ createdAt: -1 }).lean();

  const rows = items.map((o) => ({
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    orderDate: formatDate(o.orderDate),
    status: o.status,
    total: o.total || 0,
  }));

  const buffer = await exportToExcel("Sales Orders", EXPORT_COLUMNS["sales-orders"], rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="sales-orders-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
