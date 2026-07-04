import { z } from "zod";

const EMAIL_MAX = 254;
const PASSWORD_MAX = 128;

/** Reject control chars and null bytes (common injection payloads). */
function noControlChars(value, ctx) {
  if (/[\x00-\x1F\x7F]/.test(value)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid characters in input" });
  }
}

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(EMAIL_MAX, "Email is too long")
    .email("Please enter a valid email address")
    .transform((v) => v.toLowerCase())
    .superRefine(noControlChars),
  password: z
    .string()
    .min(1, "Password is required")
    .max(PASSWORD_MAX, "Password is too long")
    .superRefine(noControlChars),
});

/**
 * Parse login credentials (server or client). Returns null if honeypot tripped or invalid.
 */
export function parseLoginCredentials(raw) {
  const website = raw?.website ?? raw?.company ?? "";
  if (String(website).trim().length > 0) {
    return { ok: false, reason: "honeypot" };
  }

  const parsed = loginSchema.safeParse({
    email: raw?.email ?? "",
    password: raw?.password ?? "",
  });

  if (!parsed.success) {
    return { ok: false, reason: "validation", issues: parsed.error.flatten() };
  }

  return { ok: true, data: parsed.data };
}

export const LOGIN_FIELD_LIMITS = { email: EMAIL_MAX, password: PASSWORD_MAX };
