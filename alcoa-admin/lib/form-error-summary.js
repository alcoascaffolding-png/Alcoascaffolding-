/**
 * Turn react-hook-form's nested error object into a short, human-readable
 * message so a save button never fails silently when zod validation fails.
 *
 * Mirrors the inline handleInvalid used in QuotationFormPage, extracted so the
 * other document/CRUD forms can share the exact same behaviour.
 */

function humanizeKey(key) {
  const spaced = String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** First readable message from a single field-array entry (or nested object). */
function firstMessageFromEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  if (entry.message) return entry.message;
  const firstKey = Object.keys(entry).find((k) => k !== "ref");
  if (!firstKey) return null;
  const sub = entry[firstKey];
  return sub?.message || null;
}

/**
 * Build a concise list of issue strings from a react-hook-form errors object.
 * Nested field arrays (e.g. `items`) are surfaced as "Line item N: message".
 */
export function collectFormErrorMessages(errors, options = {}) {
  const { labels = {}, itemLabel = "Line item" } = options;
  const messages = [];
  if (!errors || typeof errors !== "object") return messages;

  for (const [key, err] of Object.entries(errors)) {
    if (!err) continue;

    if (Array.isArray(err)) {
      err.forEach((entry, i) => {
        const msg = firstMessageFromEntry(entry);
        if (msg) messages.push(`${labels[key] || itemLabel} ${i + 1}: ${msg}`);
      });
      if (err.root?.message) messages.push(err.root.message);
      continue;
    }

    if (err.message) {
      messages.push(`${labels[key] || humanizeKey(key)}: ${err.message}`);
      continue;
    }

    // Nested object of field errors (e.g. a grouped sub-form).
    const nested = firstMessageFromEntry(err);
    if (nested) messages.push(`${labels[key] || humanizeKey(key)}: ${nested}`);
  }

  return messages;
}

/**
 * Full toast string for an invalid submit, capped at `max` issues with a
 * "(+N more)" suffix. Returns e.g.
 * "Please fix the following before saving — Line item 1: Enter a rate · Customer name is required".
 */
export function formErrorToastMessage(errors, options = {}) {
  const { max = 3 } = options;
  const messages = collectFormErrorMessages(errors, options);
  const summary = messages.slice(0, max).join(" · ") || "Please check the highlighted fields.";
  const extra = messages.length > max ? ` (+${messages.length - max} more)` : "";
  return `Please fix the following before saving — ${summary}${extra}`;
}
