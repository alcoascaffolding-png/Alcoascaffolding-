import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BankAccountsClient } from "@/components/domain/accounts/BankAccountsClient";
export const metadata = { title: "Bank Accounts" };
export default function BankAccountsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Bank Accounts</h1><p className="text-sm text-muted-foreground">Manage company bank accounts</p></div>
      <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}><BankAccountsClient /></Suspense>
    </div>
  );
}
