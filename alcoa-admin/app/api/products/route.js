import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import { buildRegexSearchFilter } from "@/lib/search-utils";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";

function sanitizePreferredVendor(value) {
  if (value == null || value === "" || value === "__none__") return undefined;
  return value;
}

function buildProductFilter(searchParams) {
  const and = [];
  const stock = searchParams.get("stock");
  const category = searchParams.get("category");
  const active = searchParams.get("active");

  const searchFilter = buildRegexSearchFilter(searchParams.get("search"), [
    "name",
    "itemCode",
    "description",
  ]);
  if (searchFilter) and.push(searchFilter);

  if (category) and.push({ category });

  if (active === "true") and.push({ isActive: { $ne: false } });
  if (active === "false") and.push({ isActive: false });

  if (stock === "low") {
    and.push({ isActive: { $ne: false } });
    and.push({
      $expr: {
        $and: [
          { $gt: ["$minStock", 0] },
          { $lte: ["$currentStock", "$minStock"] },
          { $gt: ["$currentStock", 0] },
        ],
      },
    });
  } else if (stock === "out") {
    and.push({ isActive: { $ne: false }, currentStock: { $lte: 0 } });
  } else if (stock === "critical") {
    and.push({ isActive: { $ne: false } });
    and.push({
      $or: [
        { currentStock: { $lte: 0 } },
        { $expr: { $and: [{ $gt: ["$minStock", 0] }, { $lte: ["$currentStock", "$minStock"] }] } },
      ],
    });
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0];
  return { $and: and };
}

export const GET = withErrorHandler(async (request) => {
  await authorizeApi("products", "read");
  await connectDB();
  const Product = (await import("@/models/Product")).default;
  await import("@/models/Vendor"); // register Vendor ref for populate

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const skip = (page - 1) * limit;
  const filter = buildProductFilter(searchParams);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("preferredVendor", "vendorCode companyName")
      .lean(),
    Product.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("products", "write");
  await connectDB();
  const Product = (await import("@/models/Product")).default;
  const body = sanitizeMongoDocument(await request.json());
  const preferredVendor = sanitizePreferredVendor(body.preferredVendor);

  const doc = await Product.create({
    ...body,
    preferredVendor,
    createdBy: session.user.id,
  });
  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "create",
    resource: "products",
    resourceId: doc._id,
    summary: `create Product ${doc._id}`,
  });
  return apiSuccess(doc, 201);
});
