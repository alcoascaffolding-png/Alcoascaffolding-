import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { AuditLogClient } from "@/components/domain/admin/AuditLogClient";

export const metadata = { title: "Audit Log" };

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Track who created, updated, deleted, or emailed records (admin only)
        </p>
      </div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <AuditLogClient />
      </Suspense>
    </div>
  );
}
