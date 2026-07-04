import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { AuditLogClient } from "@/components/domain/admin/AuditLogClient";

export const metadata = { title: "Audit Log" };

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track who created, updated, deleted, or emailed records (admin only)"
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <AuditLogClient />
      </Suspense>
    </div>
  );
}
