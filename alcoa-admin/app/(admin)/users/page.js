import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { UsersClient } from "@/components/domain/users/UsersClient";

export const metadata = { title: "Users" };

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage admin accounts and roles"
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <UsersClient />
      </Suspense>
    </div>
  );
}
