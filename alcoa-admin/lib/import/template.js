import { exportToExcel } from "@/lib/export/excel";
import { getImportSchema } from "./schemas";

/**
 * Build an empty Excel template with header row and one example row.
 */
export async function buildImportTemplate(resource) {
  const schema = getImportSchema(resource);
  if (!schema) return null;

  const columns = schema.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: Math.max(14, Math.min(36, col.header.length + 4)),
  }));

  return exportToExcel(schema.sheetName, columns, []);
}

export function templateFilename(resource) {
  const schema = getImportSchema(resource);
  const base = schema?.label?.toLowerCase().replace(/\s+/g, "-") || resource;
  return `${base}-import-template.xlsx`;
}
