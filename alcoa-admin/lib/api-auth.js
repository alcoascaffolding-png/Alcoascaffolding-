import { auth } from "@/lib/auth";
import { AppError } from "@/lib/api-error";
import { canManageUsers, canWriteResource, canDeleteDocuments } from "@/lib/permissions";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new AppError("Unauthorized", 401);
  return session;
}

export function requireManageUsers(session) {
  if (!canManageUsers(session.user.role)) {
    throw new AppError("Forbidden — insufficient permissions", 403);
  }
}

export function requireWrite(session, resource) {
  if (!canWriteResource(session.user.role, resource)) {
    throw new AppError("Forbidden — read-only access for your role", 403);
  }
}

export function requireDelete(session) {
  if (!canDeleteDocuments(session.user.role)) {
    throw new AppError("Forbidden — you cannot delete records", 403);
  }
}
