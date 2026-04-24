import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import ContactMessage from "@/models/ContactMessage";
import { exportToExcel, EXPORT_COLUMNS } from "@/lib/export/excel";
import { formatDate } from "@/lib/utils";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();

  const rows = messages.map((m) => ({
    type: m.type,
    name: m.name,
    email: m.email,
    phone: m.phone,
    company: m.company || "",
    projectType: m.projectType || "",
    status: m.status,
    priority: m.priority,
    createdAt: formatDate(m.createdAt),
  }));

  const buffer = await exportToExcel("Contact Messages", EXPORT_COLUMNS["contact-messages"], rows);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="contact-messages-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
