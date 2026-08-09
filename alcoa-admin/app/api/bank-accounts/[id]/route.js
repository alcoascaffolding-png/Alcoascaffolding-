import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";
import { applyPrimaryOnBankAccountSave } from "@/lib/bank-account-primary";

export const GET = withErrorHandler(async (_request, { params }) => {
  await authorizeApi("bank-accounts", "read");

  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");
  const doc = await BankAccount.findById(params.id).lean();
  if (!doc) throw new AppError("Bank Account not found", 404);
  return apiSuccess(doc);
});

export const PATCH = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("bank-accounts", "write");

  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");
  const body = await request.json();
  const patch = sanitizeMongoDocument(body);

  await applyPrimaryOnBankAccountSave(BankAccount, patch, params.id);

  const existing = await BankAccount.findById(params.id).select("openingBalance currentBalance").lean();
  if (!existing) throw new AppError("Bank Account not found", 404);

  const update = { ...patch, lastModifiedBy: session.user.id };
  if (patch.openingBalance !== undefined) {
    const newOpening = Number(patch.openingBalance) || 0;
    const delta = newOpening - (Number(existing.openingBalance) || 0);
    update.openingBalance = newOpening;
    update.currentBalance = (Number(existing.currentBalance) || 0) + delta;
  }

  const doc = await BankAccount.findByIdAndUpdate(
    params.id,
    update,
    { new: true, runValidators: true }
  );
  if (!doc) throw new AppError("Bank Account not found", 404);

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "update",
    resource: "bank-accounts",
    resourceId: doc._id,
    summary: `update Bank Account ${doc._id}`,
  });

  return apiSuccess(doc);
});

export const DELETE = withErrorHandler(async (_request, { params }) => {
  const session = await authorizeApi("bank-accounts", "delete");

  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");
  const doc = await BankAccount.findByIdAndDelete(params.id);
  if (!doc) throw new AppError("Bank Account not found", 404);

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "delete",
    resource: "bank-accounts",
    resourceId: doc._id,
    summary: `delete Bank Account ${doc._id}`,
  });

  return apiSuccess({ deleted: true });
});
