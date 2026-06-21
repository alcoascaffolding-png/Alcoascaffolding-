import { requireSession, requireWrite, requireDelete } from "@/lib/api-auth";

/** @typedef {"read"|"write"|"delete"} ApiAction */

/**
 * Authenticate and enforce RBAC for an API handler.
 * @param {string} resource - Permission slug (e.g. "quotations", "products")
 * @param {ApiAction} [action="read"]
 */
export async function authorizeApi(resource, action = "read") {
  const session = await requireSession();
  if (action === "write") requireWrite(session, resource);
  if (action === "delete") {
    requireDelete(session);
    requireWrite(session, resource);
  }
  return session;
}
