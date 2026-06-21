import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { UsersClient } from "@/components/domain/users/UsersClient";

export const metadata = { title: "Users" };

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Manage admin accounts and roles</p>
      </div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <UsersClient />
      </Suspense>
    </div>
  );
}
