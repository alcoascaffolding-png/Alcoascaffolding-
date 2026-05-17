import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Product from "@/models/Product";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const products = await Product.find().sort({ itemCode: 1 }).lean();

  const rows = products.map((p) => ({
    itemCode: p.itemCode,
    name: p.name,
    category: p.category || "",
    unit: p.unit,
    sellingPrice: p.sellingPrice || 0,
    rentalPrice: p.rentalPrice || 0,
    currentStock: p.currentStock || 0,
    isActive: p.isActive !== false ? "Active" : "Inactive",
  }));

  const buffer = await exportToExcel("Products", EXPORT_COLUMNS.products, rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="products-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
