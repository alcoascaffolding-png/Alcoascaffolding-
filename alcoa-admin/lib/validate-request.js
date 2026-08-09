import { AppError } from "@/lib/api-error";

/** "customerName" / "vatPercentage" → "Customer name" / "Vat percentage". */
function humanizeKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .replace(/^./, (c) => c.toUpperCase());
}

/** Turn a Zod issue path into a friendly field label, e.g. "Line item 1 – Equipment type". */
function friendlyPath(path) {
  if (!path?.length) return "This form";
  const parts = [];
  for (let i = 0; i < path.length; i++) {
    const seg = path[i];
    if (typeof seg === "number") {
      const parent = parts.pop() || "Item";
      const singular = parent.replace(/s$/, "");
      parts.push(`${singular} ${seg + 1}`);
    } else {
      parts.push(humanizeKey(seg));
    }
  }
  return parts.join(" – ");
}

/**
 * Parse request JSON with a Zod schema. Throws AppError 400 on validation failure
 * with a clear, human-readable message (no raw field paths like "items.0.foo").
 * @param {import('zod').ZodType} schema
 * @param {unknown} body
 * @returns {import('zod').infer<typeof schema>}
 */
export function parseRequestBody(schema, body) {
  const result = schema.safeParse(body);
  if (result.success) return result.data;

  const first = result.error.issues[0];
  const label = friendlyPath(first?.path);
  const raw = first?.message || "is invalid";
  // Zod's default "Required" reads better as "<Field> is required".
  const message = /^required$/i.test(raw) ? `${label} is required` : `${label}: ${raw}`;

  const details = result.error.issues.slice(0, 5).map((issue) => {
    const l = friendlyPath(issue.path);
    return /^required$/i.test(issue.message) ? `${l} is required` : `${l}: ${issue.message}`;
  });

  throw new AppError(message, 400, details);
}
