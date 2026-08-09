import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Vendor from "@/models/Vendor";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";
import { formatDate } from "@/lib/utils";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const items = await Vendor.find().sort({ createdAt: -1 }).lean();

  const rows = items.map((v) => ({
    vendorCode: v.vendorCode,
    companyName: v.companyName,
    contactPerson: v.contactPerson || "",
    email: v.email || "",
    phone: v.phone || "",
    vatNumber: v.vatNumber || "",
    category: v.category || "",
    paymentTerms: v.paymentTerms,
    creditLimit: v.creditLimit || 0,
    status: v.status,
    createdAt: formatDate(v.createdAt),
  }));

  const buffer = await exportToExcel("Vendors", EXPORT_COLUMNS.vendors, rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="vendors-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
