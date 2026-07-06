import { createListHandlers } from "@/lib/crud-factory";
import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import Vendor from "@/models/Vendor";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";
import { assertValidCategory } from "@/lib/category-service";

const { GET } = createListHandlers(() => import("@/models/Vendor"), "Vendor", "vendors");

const VENDOR_CODE_PREFIX = "VND";

async function generateVendorCode() {
  const vendors = await Vendor.find({
    vendorCode: { $regex: `^${VENDOR_CODE_PREFIX}-\\d+$` },
  })
    .select("vendorCode")
    .lean();

  const max = vendors.reduce((highest, vendor) => {
    const match = String(vendor.vendorCode || "").match(/^VND-(\d+)$/);
    const n = match ? Number(match[1]) : 0;
    return Number.isFinite(n) && n > highest ? n : highest;
  }, 0);

  return `${VENDOR_CODE_PREFIX}-${String(max + 1).padStart(3, "0")}`;
}

const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("vendors", "write");
  await connectDB();

  const body = sanitizeMongoDocument(await request.json());
  const vendorCode = body.vendorCode?.trim() || (await generateVendorCode());

  if (!body.companyName?.trim()) {
    throw new AppError("Company name is required", 400);
  }

  const category = await assertValidCategory("vendor", body.category || "Supplier");

  const doc = await Vendor.create({
    ...body,
    vendorCode,
    companyName: body.companyName.trim(),
    category,
    createdBy: session.user.id,
  });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "create",
    resource: "vendors",
    resourceId: doc._id,
    summary: `Created vendor ${doc.vendorCode}`,
  });

  return apiSuccess(doc, 201);
});

export { GET, POST };
