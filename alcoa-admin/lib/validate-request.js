import { AppError } from "@/lib/api-error";

/**
 * Parse request JSON with a Zod schema. Throws AppError 400 on validation failure.
 * @param {import('zod').ZodType} schema
 * @param {unknown} body
 * @returns {import('zod').infer<typeof schema>}
 */
export function parseRequestBody(schema, body) {
  const result = schema.safeParse(body);
  if (result.success) return result.data;

  const first = result.error.issues[0];
  const path = first?.path?.length ? first.path.join(".") : "body";
  const message = first?.message || "Invalid request body";
  throw new AppError(`${path}: ${message}`, 400);
}
