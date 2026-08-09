import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import PurchaseOrder from "@/models/PurchaseOrder";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";
import { formatDate } from "@/lib/utils";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const items = await PurchaseOrder.find().sort({ createdAt: -1 }).lean();

  const rows = items.map((po) => ({
    poNumber: po.poNumber,
    vendorName: po.vendorName,
    orderDate: formatDate(po.orderDate),
    deliveryDate: po.deliveryDate ? formatDate(po.deliveryDate) : "",
    status: po.status,
    total: po.total || 0,
  }));

  const buffer = await exportToExcel("Purchase Orders", EXPORT_COLUMNS["purchase-orders"], rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="purchase-orders-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
