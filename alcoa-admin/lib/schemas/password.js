export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/** Reject control chars and null bytes in passwords. */
export function hasControlChars(value) {
  return /[\x00-\x1F\x7F]/.test(String(value ?? ""));
}

/**
 * Validate password length for create/update endpoints (not login-only).
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validatePasswordForSet(password) {
  const value = String(password ?? "");
  if (value.length < PASSWORD_MIN) {
    return { ok: false, message: `Password must be at least ${PASSWORD_MIN} characters` };
  }
  if (value.length > PASSWORD_MAX) {
    return { ok: false, message: `Password must be at most ${PASSWORD_MAX} characters` };
  }
  if (hasControlChars(value)) {
    return { ok: false, message: "Password contains invalid characters" };
  }
  return { ok: true };
}
