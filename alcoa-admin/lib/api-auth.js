import { auth } from "@/lib/auth";
import { AppError } from "@/lib/api-error";
import { canManageUsers, canWriteResource, canDeleteDocuments, canReadResource } from "@/lib/permissions";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new AppError("Unauthorized", 401);
  return session;
}

export function requireManageUsers(session) {
  if (!canManageUsers(session.user)) {
    throw new AppError("Forbidden — insufficient permissions", 403);
  }
}

export function requireRead(session, resource) {
  if (!canReadResource(session.user, resource)) {
    throw new AppError("Forbidden — you cannot view this module", 403);
  }
}

export function requireWrite(session, resource) {
  if (!canWriteResource(session.user, resource)) {
    throw new AppError("Forbidden — read-only access for your role", 403);
  }
}

export function requireDelete(session, resource) {
  if (!canDeleteDocuments(session.user, resource)) {
    throw new AppError("Forbidden — you cannot delete records", 403);
  }
}
