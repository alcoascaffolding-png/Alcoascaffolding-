import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardClient } from "@/components/domain/dashboard/DashboardClient";
import { RouteLoadingView } from "@/components/loading/loading-kit";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        titleClassName="text-headline"
        description="Welcome back! Here is your business overview."
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <DashboardClient />
      </Suspense>
    </div>
  );
}
