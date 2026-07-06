import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { apiSuccess, apiError } from "@/lib/api-response";
import { buildImportTemplate, templateFilename } from "@/lib/import/template";
import { getImportSchema } from "@/lib/import/schemas";
import { runImport } from "@/lib/import/run-import";

export const GET = withErrorHandler(async (request, context) => {
  const { resource } = await context.params;
  const schema = getImportSchema(resource);

  if (!schema) {
    throw new AppError(`Import template is not available for "${resource}".`, 404);
  }

  await authorizeApi(resource, "read");

  const buffer = await buildImportTemplate(resource);
  const filename = templateFilename(resource);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});

export const POST = withErrorHandler(async (request, context) => {
  const { resource } = await context.params;
  const schema = getImportSchema(resource);

  if (!schema) {
    throw new AppError(`Import is not available for "${resource}".`, 404);
  }

  const session = await authorizeApi(resource, "write");

  const formData = await request.formData();
  const file = formData.get("file");
  const mode = formData.get("mode") === "import" ? "import" : "validate";

  if (!file || typeof file === "string") {
    throw new AppError("No file uploaded. Select a CSV or Excel file.", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name || "upload.xlsx";

  const outcome = await runImport({
    resource,
    buffer,
    filename,
    mode,
    userId: session.user.id,
  });

  if (!outcome.success) {
    return apiError(outcome.message, 422, {
      errors: outcome.errors,
      rowCount: outcome.rowCount,
      mode: outcome.mode,
    });
  }

  return apiSuccess(outcome, mode === "import" ? 201 : 200);
});
