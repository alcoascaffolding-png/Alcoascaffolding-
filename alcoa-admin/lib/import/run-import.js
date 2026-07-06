import { AppError } from "@/lib/api-error";
import { parseUploadFile } from "./parse-file";
import { validateImportRows } from "./validate-import";
import { getImportSchema } from "./schemas";
import { executeImport } from "./executors";
import { connectDB } from "@/lib/db";
import { getActiveCategoryNames } from "@/lib/category-service";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

async function resolveImportSchema(resource) {
  const schema = getImportSchema(resource);
  if (!schema) return null;

  if (resource === "products" || resource === "vendors") {
    await connectDB();
    const type = resource === "vendors" ? "vendor" : "product";
    const names = await getActiveCategoryNames(type);
    return {
      ...schema,
      columns: schema.columns.map((col) =>
        col.key === "category" ? { ...col, enumValues: names } : col
      ),
    };
  }

  return schema;
}

/**
 * Parse, validate, and optionally persist imported rows.
 * @param {object} options
 * @param {string} options.resource
 * @param {Buffer|ArrayBuffer} options.buffer
 * @param {string} options.filename
 * @param {"validate"|"import"} options.mode
 * @param {string} [options.userId]
 */
export async function runImport({ resource, buffer, filename, mode = "validate", userId }) {
  const schema = await resolveImportSchema(resource);
  if (!schema) {
    throw new AppError(`Import is not available for "${resource}".`, 404);
  }

  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new AppError("File is too large. Maximum size is 5 MB.", 400);
  }

  const { headers, rows } = await parseUploadFile(buffer, filename);
  const validation = validateImportRows(schema, rows, headers);

  if (!validation.ok) {
    return {
      success: false,
      mode,
      rowCount: validation.rowCount || 0,
      errors: validation.errors,
      message:
        validation.errors[0]?.type === "missing_columns"
          ? validation.errors[0].message
          : `Found ${validation.errors.length} validation issue(s). Fix the file and try again.`,
    };
  }

  if (mode === "validate") {
    return {
      success: true,
      mode: "validate",
      rowCount: validation.rowCount,
      message: `${validation.rowCount} row(s) passed validation and are ready to import.`,
      columns: [...validation.mapping.entries()].map(([key, header]) => ({ key, header })),
    };
  }

  const result = await executeImport(resource, validation.rows, userId);

  if (result.errors.length > 0 && result.created === 0 && result.updated === 0) {
    return {
      success: false,
      mode: "import",
      rowCount: validation.rowCount,
      errors: result.errors,
      message: "Import failed. No records were saved.",
      result,
    };
  }

  return {
    success: true,
    mode: "import",
    rowCount: validation.rowCount,
    message: `Import complete: ${result.created} created, ${result.updated} updated${
      result.failed ? `, ${result.failed} failed` : ""
    }.`,
    result,
    errors: result.errors.length ? result.errors : undefined,
  };
}
