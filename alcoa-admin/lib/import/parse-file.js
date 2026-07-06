import ExcelJS from "exceljs";
import { AppError } from "@/lib/api-error";

const MAX_ROWS = 2000;
const SUPPORTED_EXTENSIONS = new Set(["csv", "xlsx", "xls"]);

function normalizeCellValue(value) {
  if (value == null) return "";
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  if (typeof value === "object" && value.text != null) {
    return String(value.text).trim();
  }
  if (typeof value === "object" && value.result != null) {
    return String(value.result).trim();
  }
  return String(value).trim();
}

/** Parse a single CSV line respecting quoted fields. */
function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function splitCsvText(text) {
  const lines = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      if (current.trim()) lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);
  return lines;
}

function parseCsv(text) {
  const lines = splitCsvText(text.replace(/^\uFEFF/, ""));
  if (!lines.length) {
    throw new AppError("The file is empty. Add a header row and at least one data row.", 400);
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, "").trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]).map((v) => v.replace(/^"|"$/g, "").trim());
    if (values.every((v) => !v)) continue;

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return { headers, rows };
}

async function parseExcel(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];

  if (!sheet) {
    throw new AppError("The Excel file has no worksheets.", 400);
  }

  const headers = [];
  const rows = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        headers[colNumber - 1] = normalizeCellValue(cell.value);
      });
      return;
    }

    const record = {};
    let hasValue = false;

    headers.forEach((header, idx) => {
      if (!header) return;
      const cell = row.getCell(idx + 1);
      const value = normalizeCellValue(cell.value);
      if (value) hasValue = true;
      record[header] = value;
    });

    if (hasValue) rows.push(record);
  });

  if (!headers.filter(Boolean).length) {
    throw new AppError("The first row must contain column headers.", 400);
  }

  return { headers: headers.filter(Boolean), rows };
}

/**
 * Parse an uploaded CSV or Excel file into header + row objects.
 * @param {Buffer|ArrayBuffer} buffer
 * @param {string} filename
 */
export async function parseUploadFile(buffer, filename) {
  const ext = String(filename || "")
    .split(".")
    .pop()
    ?.toLowerCase();

  if (!ext || !SUPPORTED_EXTENSIONS.has(ext)) {
    throw new AppError(
      "Unsupported file type. Please upload a .csv or .xlsx file.",
      400
    );
  }

  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  let parsed;
  if (ext === "csv") {
    parsed = parseCsv(nodeBuffer.toString("utf8"));
  } else {
    parsed = await parseExcel(nodeBuffer);
  }

  if (!parsed.rows.length) {
    throw new AppError(
      "No data rows found. The file must include a header row and at least one row of data.",
      400
    );
  }

  if (parsed.rows.length > MAX_ROWS) {
    throw new AppError(
      `Too many rows (${parsed.rows.length}). Maximum allowed is ${MAX_ROWS} rows per import.`,
      400
    );
  }

  return parsed;
}
