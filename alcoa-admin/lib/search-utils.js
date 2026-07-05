/** Escape user input for safe use inside RegExp. */
export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildRegexSearchFilter(search, fields) {
  const term = String(search || "").trim();
  if (!term) return null;
  const rx = new RegExp(escapeRegex(term), "i");
  return { $or: fields.map((field) => ({ [field]: rx })) };
}
