import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import DeliveryNote from "@/models/DeliveryNote";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";
import { formatDate } from "@/lib/utils";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const items = await DeliveryNote.find().sort({ createdAt: -1 }).lean();

  const rows = items.map((dn) => ({
    deliveryNoteNumber: dn.deliveryNoteNumber,
    customerName: dn.customerName,
    deliveryDate: formatDate(dn.deliveryDate),
    status: dn.status,
    driverName: dn.driverName || "",
  }));

  const buffer = await exportToExcel("Delivery Notes", EXPORT_COLUMNS["delivery-notes"], rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="delivery-notes-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
