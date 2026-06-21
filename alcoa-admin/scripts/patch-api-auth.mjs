import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const patches = [
  ["app/api/quotations/[id]/route.js", "quotations", ["DELETE"]],
  ["app/api/sales-orders/route.js", "sales-orders", ["GET", "POST"]],
  ["app/api/sales-orders/[id]/route.js", "sales-orders", ["GET", "PATCH", "DELETE"]],
  ["app/api/sales-invoices/route.js", "sales-invoices", ["GET", "POST"]],
  ["app/api/sales-invoices/[id]/route.js", "sales-invoices", ["GET", "PATCH", "DELETE"]],
  ["app/api/delivery-notes/route.js", "delivery-notes", ["GET", "POST"]],
  ["app/api/delivery-notes/[id]/route.js", "delivery-notes", ["GET", "PATCH", "DELETE"]],
  ["app/api/customers/route.js", "customers", ["GET", "POST"]],
  ["app/api/customers/[id]/route.js", "customers", ["GET", "PATCH", "DELETE"]],
  ["app/api/purchase-orders/[id]/route.js", "purchase-orders", ["GET", "PATCH", "DELETE"]],
  ["app/api/purchase-invoices/route.js", "purchase-invoices", ["GET", "POST"]],
  ["app/api/purchase-invoices/[id]/route.js", "purchase-invoices", ["GET", "PATCH", "DELETE"]],
  ["app/api/payments/route.js", "payments", ["POST"]],
  ["app/api/payments/[id]/route.js", "payments", ["GET", "PATCH", "DELETE"]],
  ["app/api/receipts/[id]/route.js", "receipts", ["GET", "PATCH", "DELETE"]],
  ["app/api/stock-adjustments/[id]/route.js", "stock-adjustments", ["GET", "DELETE"]],
  ["app/api/contact-messages/[id]/route.js", "contact-messages", ["GET", "PATCH", "DELETE"]],
];

const authSnippet =
  /const session = await auth\(\);\s*\r?\n\s*if \(!session\?\.user\) return apiError\("Unauthorized", 401\);/g;

for (const [rel, resource, methods] of patches) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.log("skip missing", rel);
    continue;
  }
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("authorizeApi")) {
    src = src.replace(/import \{ auth \} from "@\/lib\/auth";\r?\n/, "");
    if (!src.includes('from "@/lib/api-guard"')) {
      src = src.replace(
        /import \{ withErrorHandler/,
        'import { authorizeApi } from "@/lib/api-guard";\nimport { withErrorHandler'
      );
    }
  }

  for (const method of methods) {
    const action = method === "GET" ? "read" : method === "DELETE" ? "delete" : "write";
    const re = new RegExp(
      `(export const ${method} = withErrorHandler\\(async \\([^)]*\\) => \\{)\\s*const session = await auth\\(\\);\\s*if \\(!session\\?\\.user\\) return apiError\\("Unauthorized", 401\\);`,
      "g"
    );
    if (method === "GET" && !src.includes(`export const GET`)) continue;
    src = src.replace(re, `$1\n  const session = await authorizeApi("${resource}", "${action}");`);
    const reGetNoSession = new RegExp(
      `(export const GET = withErrorHandler\\(async \\([^)]*\\) => \\{)\\s*const session = await auth\\(\\);\\s*if \\(!session\\?\\.user\\) return apiError\\("Unauthorized", 401\\);`,
      "g"
    );
    if (method === "GET") {
      src = src.replace(reGetNoSession, `$1\n  await authorizeApi("${resource}", "read");`);
    }
  }

  // GET handlers that don't need session variable
  src = src.replace(
    /(export const GET = withErrorHandler\(async \(request\) => \{\s*)const session = await auth\(\);\s*if \(!session\?\.user\) return apiError\("Unauthorized", 401\);/g,
    `$1await authorizeApi("${resource}", "read");`
  );

  fs.writeFileSync(file, src);
  console.log("patched", rel);
}
