import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Customer from "@/models/Customer";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";
import { formatDate } from "@/lib/utils";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const customers = await Customer.find().sort({ createdAt: -1 }).lean();

  const rows = customers.map((c) => ({
    companyName: c.companyName,
    businessType: c.businessType,
    primaryEmail: c.primaryEmail || "",
    primaryPhone: c.primaryPhone || "",
    status: c.status,
    customerType: c.customerType,
    paymentTerms: c.paymentTerms,
    totalRevenue: c.totalRevenue || 0,
    totalOrders: c.totalOrders || 0,
    source: c.source,
    createdAt: formatDate(c.createdAt),
  }));

  const buffer = await exportToExcel("Customers", EXPORT_COLUMNS.customers, rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
