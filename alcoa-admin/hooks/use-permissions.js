"use client";

import { useSession } from "next-auth/react";
import {
  canAccessNavPath,
  canManageUsers,
  canWriteResource,
  canDeleteDocuments,
  canReadResource,
  hasPermission,
} from "@/lib/permissions";

export function usePermissions() {
  const { data: session } = useSession();
  const user = session?.user;

  return {
    user,
    role: user?.role,
    canManageUsers: () => canManageUsers(user),
    canAccessNavPath: (pathname) => canAccessNavPath(user, pathname),
    canRead: (resource) => canReadResource(user, resource),
    canWrite: (resource) => canWriteResource(user, resource),
    canDelete: (resource) => canDeleteDocuments(user, resource),
    has: (resource, action) => hasPermission(user, resource, action),
  };
}
