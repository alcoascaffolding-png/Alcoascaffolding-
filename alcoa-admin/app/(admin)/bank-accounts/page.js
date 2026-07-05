import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { BankAccountsClient } from "@/components/domain/accounts/BankAccountsClient";

export const metadata = { title: "Bank Accounts" };

export default function BankAccountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Accounts"
        description="Manage company bank accounts. Star an account to set it as primary — it becomes the default on new quotations and quotation PDFs."
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <BankAccountsClient />
      </Suspense>
    </div>
  );
}
