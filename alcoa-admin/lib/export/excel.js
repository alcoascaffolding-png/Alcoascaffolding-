/**
 * Server-side Excel export utility using ExcelJS.
 * Replaces the old client-side `xlsx` bundle used in the Vite admin panel.
 *
 * Usage in a Route Handler:
 *   const buffer = await exportToExcel("Customers", columns, data);
 *   return new Response(buffer, {
 *     headers: {
 *       "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
 *       "Content-Disposition": `attachment; filename="customers.xlsx"`,
 *     },
 *   });
 */

import ExcelJS from "exceljs";

const HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF97316" }, // Alcoa orange
};

const HEADER_FONT = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

/**
 * Export an array of objects to an Excel buffer.
 *
 * @param {string} sheetName - The worksheet title
 * @param {Array<{header: string, key: string, width?: number}>} columns
 * @param {Array<object>} data
 * @returns {Promise<Buffer>}
 */
export async function exportToExcel(sheetName, columns, data) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = process.env.NEXT_PUBLIC_APP_NAME || "Alcoa Admin";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
    style: { numFmt: col.numFmt },
  }));

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = HEADER_FONT;
  headerRow.fill = HEADER_FILL;
  headerRow.alignment = { vertical: "middle", horizontal: "left" };
  headerRow.height = 24;
  headerRow.commit();

  // Add data rows
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  // Freeze header row
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  return await workbook.xlsx.writeBuffer();
}

/**
 * Pre-built column definitions for each resource
 */
export const EXPORT_COLUMNS = {
  customers: [
    { header: "Company Name", key: "companyName", width: 30 },
    { header: "Business Type", key: "businessType", width: 20 },
    { header: "Email", key: "primaryEmail", width: 30 },
    { header: "Phone", key: "primaryPhone", width: 18 },
    { header: "Status", key: "status", width: 12 },
    { header: "Customer Type", key: "customerType", width: 14 },
    { header: "Payment Terms", key: "paymentTerms", width: 14 },
    { header: "Total Revenue (AED)", key: "totalRevenue", width: 20, numFmt: "#,##0.00" },
    { header: "Total Orders", key: "totalOrders", width: 14 },
    { header: "Source", key: "source", width: 16 },
    { header: "Created", key: "createdAt", width: 18 },
  ],
  quotations: [
    { header: "Quote #", key: "quoteNumber", width: 16 },
    { header: "Customer", key: "customerName", width: 30 },
    { header: "Quote Date", key: "quoteDate", width: 14 },
    { header: "Valid Until", key: "validUntil", width: 14 },
    { header: "Type", key: "quoteType", width: 12 },
    { header: "Status", key: "status", width: 12 },
    { header: "Total (AED)", key: "totalAmount", width: 18, numFmt: "#,##0.00" },
    { header: "Sales Executive", key: "salesExecutive", width: 20 },
  ],
  "contact-messages": [
    { header: "Type", key: "type", width: 12 },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Company", key: "company", width: 24 },
    { header: "Project Type", key: "projectType", width: 18 },
    { header: "Status", key: "status", width: 14 },
    { header: "Priority", key: "priority", width: 12 },
    { header: "Received", key: "createdAt", width: 20 },
  ],
  products: [
    { header: "Item Code", key: "itemCode", width: 14 },
    { header: "Name", key: "name", width: 30 },
    { header: "Category", key: "category", width: 24 },
    { header: "Unit", key: "unit", width: 10 },
    { header: "Selling Price (AED)", key: "sellingPrice", width: 20, numFmt: "#,##0.00" },
    { header: "Rental Price/Day (AED)", key: "rentalPrice", width: 22, numFmt: "#,##0.00" },
    { header: "Stock", key: "currentStock", width: 12 },
    { header: "Status", key: "isActive", width: 10 },
  ],
};
