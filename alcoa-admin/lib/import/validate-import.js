/**
 * Validate parsed spreadsheet rows against an import schema.
 */

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function headerAliases(column) {
  const aliases = new Set([column.key, column.header, ...(column.aliases || [])]);
  return [...aliases].map(normalizeHeader).filter(Boolean);
}

/**
 * Map file header strings to schema column keys.
 * @returns {{ mapping: Map<string, string>, missingRequired: string[] }}
 */
export function mapFileHeaders(fileHeaders, columns) {
  const normalizedFile = fileHeaders.map((h) => ({
    original: h,
    norm: normalizeHeader(h),
  }));

  const mapping = new Map();
  const usedFileHeaders = new Set();

  for (const column of columns) {
    const aliases = headerAliases(column);
    const match = normalizedFile.find(
      (fh) => !usedFileHeaders.has(fh.original) && aliases.includes(fh.norm)
    );
    if (match) {
      mapping.set(column.key, match.original);
      usedFileHeaders.add(match.original);
    }
  }

  const missingRequired = columns
    .filter((c) => c.required && !mapping.has(c.key))
    .map((c) => c.header);

  return { mapping, missingRequired };
}

function isEmpty(value) {
  return value == null || String(value).trim() === "";
}

function parseBoolean(value) {
  const v = String(value).trim().toLowerCase();
  if (["true", "yes", "y", "1", "active"].includes(v)) return true;
  if (["false", "no", "n", "0", "inactive"].includes(v)) return false;
  return null;
}

function parseNumber(value) {
  const cleaned = String(value).replace(/,/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseEmail(value) {
  const v = String(value).trim().toLowerCase();
  if (!v) return "";
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  return ok ? v : null;
}

function validateCell(column, rawValue, rowNumber) {
  const label = column.header;
  const empty = isEmpty(rawValue);

  if (column.required && empty) {
    return {
      row: rowNumber,
      column: label,
      message: `Row ${rowNumber}: "${label}" is required but empty.`,
    };
  }

  if (empty) return null;

  const value = String(rawValue).trim();

  switch (column.type) {
    case "string":
      return null;

    case "email": {
      const email = parseEmail(value);
      if (email === null) {
        return {
          row: rowNumber,
          column: label,
          message: `Row ${rowNumber}: "${label}" must be a valid email address (got "${value}").`,
        };
      }
      return null;
    }

    case "number": {
      const n = parseNumber(value);
      if (n === null) {
        return {
          row: rowNumber,
          column: label,
          message: `Row ${rowNumber}: "${label}" must be a number (got "${value}").`,
        };
      }
      if (column.min != null && n < column.min) {
        return {
          row: rowNumber,
          column: label,
          message: `Row ${rowNumber}: "${label}" must be at least ${column.min} (got ${n}).`,
        };
      }
      return null;
    }

    case "boolean": {
      const b = parseBoolean(value);
      if (b === null) {
        return {
          row: rowNumber,
          column: label,
          message: `Row ${rowNumber}: "${label}" must be Active, Inactive, Yes, No, True, or False (got "${value}").`,
        };
      }
      return null;
    }

    case "enum": {
      const allowed = column.enumValues || [];
      const match = allowed.find(
        (opt) => String(opt).toLowerCase() === value.toLowerCase()
      );
      if (!match) {
        const hint =
          column.key === "category"
            ? " Add the category under Product/Vendor Categories first, or see the Reference sheet in the template."
            : "";
        return {
          row: rowNumber,
          column: label,
          message: `Row ${rowNumber}: "${label}" must be one of: ${allowed.join(", ")} (got "${value}").${hint}`,
        };
      }
      return null;
    }

    case "date": {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        return {
          row: rowNumber,
          column: label,
          message: `Row ${rowNumber}: "${label}" must be a valid date (got "${value}").`,
        };
      }
      return null;
    }

    default:
      return null;
  }
}

function coerceCell(column, rawValue) {
  if (isEmpty(rawValue)) {
    if (column.default !== undefined) return column.default;
    return undefined;
  }

  const value = String(rawValue).trim();

  switch (column.type) {
    case "string":
    case "fk":
      return value;

    case "email":
      return parseEmail(value) || "";

    case "number":
      return parseNumber(value) ?? 0;

    case "boolean":
      return parseBoolean(value) ?? false;

    case "enum": {
      const allowed = column.enumValues || [];
      return allowed.find((opt) => String(opt).toLowerCase() === value.toLowerCase()) ?? value;
    }

    case "date":
      return new Date(value);

    default:
      return value;
  }
}

/**
 * @param {object} schema
 * @param {Array<object>} rawRows - objects keyed by file header names
 * @param {string[]} fileHeaders
 */
export function validateImportRows(schema, rawRows, fileHeaders) {
  const { mapping, missingRequired } = mapFileHeaders(fileHeaders, schema.columns);

  if (missingRequired.length) {
    return {
      ok: false,
      errors: [
        {
          type: "missing_columns",
          message: `Missing required column(s): ${missingRequired.join(", ")}. Download the template to see the expected format.`,
          columns: missingRequired,
        },
      ],
      rows: [],
      mapping,
    };
  }

  const errors = [];
  const rows = [];

  rawRows.forEach((rawRow, index) => {
    const rowNumber = index + 2;
    const mapped = {};

    for (const column of schema.columns) {
      const fileHeader = mapping.get(column.key);
      const rawValue = fileHeader ? rawRow[fileHeader] : undefined;

      const cellError = validateCell(column, rawValue, rowNumber);
      if (cellError) errors.push(cellError);

      mapped[column.key] = coerceCell(column, rawValue);
    }

    rows.push({ rowNumber, data: mapped });
  });

  return {
    ok: errors.length === 0,
    errors,
    rows,
    mapping,
    rowCount: rows.length,
  };
}

export function formatValidationErrors(errors, max = 20) {
  if (!errors?.length) return "";
  const slice = errors.slice(0, max);
  const lines = slice.map((e) => e.message || String(e));
  if (errors.length > max) {
    lines.push(`…and ${errors.length - max} more issue(s).`);
  }
  return lines.join("\n");
}
