import { Suspense } from "react";
import { DashboardClient } from "@/components/domain/dashboard/DashboardClient";
import { RouteLoadingView } from "@/components/loading/loading-kit";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here is your business overview.</p>
      </div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <DashboardClient />
      </Suspense>
    </div>
  );
}
