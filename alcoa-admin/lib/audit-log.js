import AuditLog from "@/models/AuditLog";

/**
 * Resolve the acting user for an audit entry.
 * Prefers an explicit NextAuth `session` so the correct actor is always
 * recorded; falls back to explicit `userId`/`userEmail` for legacy callers.
 */
function resolveActor(input) {
  const sessionUser = input.session?.user;
  if (sessionUser) {
    return { userId: sessionUser.id, userEmail: sessionUser.email };
  }
  return { userId: input.userId, userEmail: input.userEmail };
}

/**
 * Fire-and-forget audit entry for document mutations.
 *
 * Pass either a NextAuth `session` (preferred — the actor is derived from
 * `session.user`) or an explicit `userId`/`userEmail`.
 *
 * @param {Object} input
 * @param {Object} [input.session] - NextAuth session; actor read from session.user
 * @param {string} [input.userId] - Acting user id (legacy / when no session)
 * @param {string} [input.userEmail] - Acting user email (legacy / when no session)
 * @param {string} input.action - One of the AuditLog action enum values
 * @param {string} input.resource - Module/resource slug (e.g. "quotations")
 * @param {string|Object} [input.resourceId] - Target record id
 * @param {string} [input.summary] - Human-readable summary
 * @param {Object} [input.metadata] - Optional structured metadata
 */
export function logAudit(input) {
  const { userId, userEmail } = resolveActor(input);
  const { action, resource, resourceId, summary, metadata } = input;
  if (!userId || !action || !resource) return;
  AuditLog.create({
    user: userId,
    userEmail: userEmail || undefined,
    action,
    resource,
    resourceId: resourceId != null ? String(resourceId) : undefined,
    summary: summary || undefined,
    metadata: metadata || undefined,
  }).catch((err) => {
    console.error("[audit-log]", err.message);
  });
}
