import { Suspense } from "react";
import { DashboardClient } from "@/components/domain/dashboard/DashboardClient";
import { RouteLoadingView } from "@/components/loading/loading-kit";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <DashboardClient />
    </Suspense>
  );
}
