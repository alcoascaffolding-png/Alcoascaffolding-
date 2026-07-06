import ExcelJS from "exceljs";
import { connectDB } from "@/lib/db";
import { getActiveCategoryNames } from "@/lib/category-service";
import { getImportSchema } from "./schemas";

const HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF4F46E5" },
};

const HEADER_FONT = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

const REF_HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF0F766E" },
};

function styleHeaderRow(row, fill = HEADER_FILL) {
  row.font = HEADER_FONT;
  row.fill = fill;
  row.alignment = { vertical: "middle", horizontal: "left" };
  row.height = 24;
  row.commit();
}

function addDataSheet(workbook, sheetName, columns, { exampleRow } = {}) {
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  styleHeaderRow(sheet.getRow(1));

  if (exampleRow) {
    const row = sheet.addRow(exampleRow);
    row.font = { italic: true, color: { argb: "FF6B7280" } };
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  return sheet;
}

function addReferenceSheet(workbook, { categoryType, categories }) {
  const sheet = workbook.addWorksheet("Reference");
  const typeLabel = categoryType === "vendor" ? "Vendor" : "Product";

  sheet.getColumn(1).width = 36;
  sheet.getColumn(2).width = 48;

  sheet.mergeCells("A1:B1");
  const title = sheet.getCell("A1");
  title.value = `${typeLabel} import — allowed values`;
  title.font = { bold: true, size: 12 };
  title.alignment = { vertical: "middle" };

  sheet.getCell("A3").value = "Field";
  sheet.getCell("B3").value = "Allowed values";
  styleHeaderRow(sheet.getRow(3), REF_HEADER_FILL);

  sheet.getCell("A4").value = "Category";
  sheet.getCell("B4").value = "Use exact names from the list below (case-insensitive).";
  sheet.getCell("A5").value = "Status";
  sheet.getCell("B5").value = "Active, Inactive, Yes, No, True, False, 1, 0";

  sheet.getCell("A7").value = `${typeLabel} categories`;
  sheet.getCell("A7").font = { bold: true };
  sheet.getCell("B7").value = "Copy into the Category column on the data sheet";
  sheet.getCell("B7").font = { bold: true };

  const startRow = 8;
  categories.forEach((name, index) => {
    sheet.getCell(`A${startRow + index}`).value = name;
  });

  sheet.getCell("A20").value = "Notes";
  sheet.getCell("A20").font = { bold: true };
  sheet.getCell("B20").value =
    "Leave optional columns empty if not needed. Delete the gray example row before importing.";
  sheet.getCell("B21").value =
    `Add new categories in the admin panel under ${categoryType === "vendor" ? "Purchases → Vendor Categories" : "Inventory → Product Categories"} before importing.`;

  const endRow = startRow + Math.max(categories.length, 1) - 1;
  return { listStartRow: startRow, listEndRow: endRow };
}

/**
 * Build import template workbook (data sheet + Reference sheet for products/vendors).
 */
export async function buildImportTemplate(resource) {
  const schema = getImportSchema(resource);
  if (!schema) return null;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = process.env.NEXT_PUBLIC_APP_NAME || "Alcoa Admin";
  workbook.created = new Date();

  const columns = schema.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: Math.max(14, Math.min(36, col.header.length + 4)),
  }));

  let exampleRow;
  let categories = [];
  let categoryType;

  if (resource === "products" || resource === "vendors") {
    await connectDB();
    categoryType = resource === "vendors" ? "vendor" : "product";
    categories = await getActiveCategoryNames(categoryType);

    if (resource === "products") {
      exampleRow = {
        itemCode: "ALU-001",
        name: "Example product (delete this row)",
        category: categories[0] || "Other",
        unit: "Nos",
        sellingPrice: 0,
        rentalPrice: 0,
        purchasePrice: 0,
        currentStock: 0,
        minStock: 0,
        reorderLevel: 0,
        maxStock: 0,
        preferredVendorCode: "",
        isActive: "Active",
        description: "",
      };
    } else {
      exampleRow = {
        vendorCode: "",
        companyName: "Example vendor (delete this row)",
        contactPerson: "",
        email: "",
        phone: "",
        emirate: "Dubai",
        vatNumber: "",
        tradeLicenseNumber: "",
        paymentTerms: "Cash",
        category: categories[0] || "Supplier",
        creditLimit: 0,
        status: "active",
        notes: "",
      };
    }
  }

  const dataSheet = addDataSheet(workbook, schema.sheetName, columns, { exampleRow });

  if (categories.length > 0) {
    const ref = addReferenceSheet(workbook, { categoryType, categories });
    const categoryListRange = `Reference!$A$${ref.listStartRow}:$A$${ref.listEndRow}`;
    const categoryCol = columns.findIndex((c) => c.key === "category") + 1;
    if (categoryCol > 0) {
      const colLetter = dataSheet.getColumn(categoryCol).letter;
      dataSheet.dataValidations.add(`${colLetter}2:${colLetter}2000`, {
        type: "list",
        allowBlank: true,
        formulae: [categoryListRange],
        showErrorMessage: true,
        errorTitle: "Invalid category",
        error: "Choose a category from the Reference sheet list.",
      });
    }
  }

  return await workbook.xlsx.writeBuffer();
}

export function templateFilename(resource) {
  const schema = getImportSchema(resource);
  const base = schema?.label?.toLowerCase().replace(/\s+/g, "-") || resource;
  return `${base}-import-template.xlsx`;
}
