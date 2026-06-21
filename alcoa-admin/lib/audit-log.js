import AuditLog from "@/models/AuditLog";

/**
 * Fire-and-forget audit entry for document mutations.
 */
export function logAudit({ userId, userEmail, action, resource, resourceId, summary, metadata }) {
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
