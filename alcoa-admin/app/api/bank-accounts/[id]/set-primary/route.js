import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import { setPrimaryBankAccount } from "@/lib/bank-account-primary";

export const POST = withErrorHandler(async (_request, { params }) => {
  const session = await authorizeApi("bank-accounts", "write");

  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");

  const existing = await BankAccount.findById(params.id);
  if (!existing) throw new AppError("Bank Account not found", 404);

  const doc = await setPrimaryBankAccount(BankAccount, params.id);

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "update",
    resource: "bank-accounts",
    resourceId: doc._id,
    summary: `Set primary bank account ${doc.accountNumber}`,
  });

  return apiSuccess(doc);
});
