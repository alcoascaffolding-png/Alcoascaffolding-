/** Escape user input for safe use inside RegExp. */
export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Max length for search query strings (ReDoS / abuse mitigation). */
export const SEARCH_MAX_LENGTH = 200;

export function normalizeSearchTerm(search) {
  const term = String(search || "").trim();
  if (!term) return "";
  return term.length > SEARCH_MAX_LENGTH ? term.slice(0, SEARCH_MAX_LENGTH) : term;
}

export function buildRegexSearchFilter(search, fields) {
  const term = normalizeSearchTerm(search);
  if (!term) return null;
  const rx = new RegExp(escapeRegex(term), "i");
  return { $or: fields.map((field) => ({ [field]: rx })) };
}

/** Safe regex for generic CRUD list search across common text fields. */
export function buildGenericCrudSearchFilter(search) {
  const term = normalizeSearchTerm(search);
  if (!term) return null;
  const rx = new RegExp(escapeRegex(term), "i");
  return {
    $or: [
      { name: rx },
      { companyName: rx },
      { description: rx },
      { itemCode: rx },
      { vendorCode: rx },
      { orderNumber: rx },
      { invoiceNumber: rx },
      { poNumber: rx },
      { receiptNumber: rx },
      { accountName: rx },
      { bankName: rx },
    ],
  };
}
