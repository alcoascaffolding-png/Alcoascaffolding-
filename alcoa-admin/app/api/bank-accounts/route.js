import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";
import { buildGenericCrudSearchFilter } from "@/lib/search-utils";
import { applyPrimaryOnBankAccountSave } from "@/lib/bank-account-primary";

export const GET = withErrorHandler(async (request) => {
  await authorizeApi("bank-accounts", "read");

  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const skip = (page - 1) * limit;

  const filter = {};
  const searchFilter = buildGenericCrudSearchFilter(searchParams.get("search"));
  if (searchFilter) Object.assign(filter, searchFilter);

  const [items, total] = await Promise.all([
    BankAccount.find(filter).sort({ isPrimary: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    BankAccount.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("bank-accounts", "write");

  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");
  const body = await request.json();
  const patch = sanitizeMongoDocument(body);

  await applyPrimaryOnBankAccountSave(BankAccount, patch);

  const openingBalance = Number(patch.openingBalance) || 0;

  const doc = await BankAccount.create({
    ...patch,
    openingBalance,
    currentBalance: openingBalance,
    createdBy: session.user.id,
  });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "create",
    resource: "bank-accounts",
    resourceId: doc._id,
    summary: `create Bank Account ${doc._id}`,
  });

  return apiSuccess(doc, 201);
});
