import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";

export const GET = withErrorHandler(async () => {
  await authorizeApi("bank-accounts", "read");

  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");

  const [agg, primary] = await Promise.all([
    BankAccount.aggregate([{ $group: { _id: null, total: { $sum: 1 } } }]),
    BankAccount.findOne({ isPrimary: true }).select("bankName accountNumber accountName").lean(),
  ]);

  const stats = agg[0] || { total: 0 };

  return apiSuccess({
    ...stats,
    primaryLabel: primary
      ? `${primary.bankName} — ${primary.accountNumber}`
      : null,
  });
});
