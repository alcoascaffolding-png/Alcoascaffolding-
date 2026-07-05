/**
 * Strip MongoDB operator keys and dotted paths from user-supplied documents.
 * Prevents NoSQL injection via `$set`, `$gt`, etc. in request bodies.
 */

const DEFAULT_DENY = new Set([
  "_id",
  "__v",
  "createdAt",
  "updatedAt",
  "createdBy",
]);

export function isDangerousMongoKey(key) {
  return typeof key === "string" && (key.startsWith("$") || key.includes("."));
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (!isPlainObject(value)) return value;

  const out = {};
  for (const [key, nested] of Object.entries(value)) {
    if (isDangerousMongoKey(key)) continue;
    out[key] = sanitizeValue(nested);
  }
  return out;
}

/**
 * @param {Record<string, unknown>} body
 * @param {{ allowedFields?: string[], denyFields?: string[] }} [options]
 */
export function sanitizeMongoDocument(body, options = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};

  const deny = new Set([...DEFAULT_DENY, ...(options.denyFields || [])]);
  const allow = options.allowedFields ? new Set(options.allowedFields) : null;
  const out = {};

  for (const [key, value] of Object.entries(body)) {
    if (isDangerousMongoKey(key)) continue;
    if (deny.has(key)) continue;
    if (allow && !allow.has(key)) continue;
    out[key] = sanitizeValue(value);
  }

  return out;
}
