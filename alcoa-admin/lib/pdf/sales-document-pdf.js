import { launchBrowser } from "./chromium";
import {
  getQuotationCompanyName,
  getQuotationCompanyEmail,
  getQuotationHeaderDataUri,
  getQuotationFooterDataUri,
} from "@/lib/quotation-brand";

function formatDate(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatCurrency(amount, currency = "AED") {
  return `${currency} ${Number(amount || 0).toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildDocHTML(doc, kind, options = {}) {
  const { headerDataUri = "", footerDataUri = "" } = options;
  const companyName = getQuotationCompanyName();
  const companyEmail = getQuotationCompanyEmail();

  const isOrder = kind === "order";
  const refLabel = isOrder ? "Order #" : "Invoice #";
  const refValue = isOrder ? doc.orderNumber : doc.invoiceNumber;
  const date1Label = isOrder ? "Order date" : "Invoice date";
  const date1 = isOrder ? doc.orderDate : doc.invoiceDate;
  const date2Label = isOrder ? "Delivery date" : "Due date";
  const date2 = isOrder ? doc.deliveryDate : doc.dueDate;
  const extraMeta = !isOrder
    ? `<tr><td class="k">Payment</td><td class="v" colspan="3">${String(doc.paymentStatus || "").replace(/_/g, " ")}</td></tr>
       <tr><td class="k">Paid</td><td class="v">${formatCurrency(doc.paidAmount || 0, doc.currency)}</td><td class="k">Balance</td><td class="v">${formatCurrency(doc.balance ?? Math.max(0, Number(doc.total || 0) - Number(doc.paidAmount || 0)), doc.currency)}</td></tr>`
    : `<tr><td class="k">Status</td><td class="v" colspan="3">${String(doc.status || "").replace(/_/g, " ")}</td></tr>`;

  const headerBlock = headerDataUri
    ? `<div class="top-brand"><img class="hdr" src="${headerDataUri}" alt="" /></div>`
    : `<div class="fallback-hdr"><strong>${companyName}</strong><span>${refLabel} ${refValue}</span></div>`;

  const footerBlock = footerDataUri
    ? `<div class="footer-main"><img class="ftr" src="${footerDataUri}" alt="" /></div>`
    : `<div class="footer-text">${companyName} · ${companyEmail}</div>`;

  const rows = (doc.items || [])
    .map(
      (it, i) => `
    <tr>
      <td class="c">${i + 1}</td>
      <td>${String(it.description || "").replace(/</g, "&lt;")}</td>
      <td class="r">${Number(it.quantity || 0)}</td>
      <td class="c">${String(it.unit || "Nos").replace(/</g, "&lt;")}</td>
      <td class="r">${formatCurrency(it.unitPrice, doc.currency)}</td>
      <td class="r">${formatCurrency(it.total, doc.currency)}</td>
    </tr>`
    )
    .join("");

  const title = isOrder ? "SALES ORDER" : "SALES INVOICE";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; font-size: 11px; }
    .pdf-page { min-height: 297mm; padding: 12mm 10mm 10mm; display: flex; flex-direction: column; }
    .first-page { padding-top: 0; }
    .top-brand { width: calc(100% + 20mm); margin-left: -10mm; line-height: 0; }
    .top-brand .hdr { width: 100%; height: auto; display: block; }
    .fallback-hdr { background: #1d3a6c; color: #fff; padding: 14px 10mm; display: flex; justify-content: space-between; align-items: center; }
    .doc-title { text-align: center; font-size: 18px; font-weight: 800; letter-spacing: 0.12em; color: #1d3a6c; margin: 14px 0 10px; }
    .meta { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .meta td { padding: 4px 8px; border: 1px solid #cbd5e1; }
    .meta .k { width: 22%; background: #f1f5f9; font-weight: 600; color: #334155; }
    .meta .v { width: 28%; }
    table.items { width: 100%; border-collapse: collapse; margin-top: 6px; }
    table.items th { background: #1d3a6c; color: #fff; padding: 8px 6px; font-size: 10px; text-align: left; }
    table.items th.r, table.items td.r { text-align: right; }
    table.items th.c, table.items td.c { text-align: center; }
    table.items td { padding: 7px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .totals { margin-top: 12px; width: 100%; }
    .totals-inner { margin-left: auto; width: 260px; border-collapse: collapse; }
    .totals-inner td { padding: 5px 8px; }
    .totals-inner .lbl { color: #64748b; }
    .totals-inner .val { text-align: right; font-weight: 600; }
    .totals-inner .grand td { border-top: 2px solid #1d3a6c; font-size: 13px; font-weight: 800; color: #1d3a6c; }
    .notes { margin-top: 14px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
    .grow { flex: 1; }
    .footer-main { width: calc(100% + 20mm); margin-left: -10mm; margin-top: auto; margin-bottom: 0; line-height: 0; }
    .footer-main .ftr { width: 100%; height: auto; display: block; }
    .footer-text { margin-top: auto; text-align: center; font-size: 10px; color: #64748b; padding: 8px 0; }
  </style>
</head>
<body>
  <section class="pdf-page first-page">
    ${headerBlock}
    <div class="doc-title">${title}</div>
    <table class="meta">
      <tr>
        <td class="k">${refLabel}</td><td class="v"><strong>${String(refValue).replace(/</g, "&lt;")}</strong></td>
        <td class="k">${date1Label}</td><td class="v">${formatDate(date1)}</td>
      </tr>
      <tr>
        <td class="k">Customer</td><td class="v" colspan="3"><strong>${String(doc.customerName || "").replace(/</g, "&lt;")}</strong></td>
      </tr>
      <tr>
        <td class="k">Email / Phone</td>
        <td class="v" colspan="3">${[doc.customerEmail, doc.customerPhone].filter(Boolean).join(" · ").replace(/</g, "&lt;") || "—"}</td>
      </tr>
      <tr>
        <td class="k">${date2Label}</td><td class="v">${date2 ? formatDate(date2) : "—"}</td>
        <td class="k">Currency</td><td class="v">${String(doc.currency || "AED").replace(/</g, "&lt;")}</td>
      </tr>
      ${extraMeta}
    </table>

    <table class="items">
      <thead>
        <tr>
          <th style="width:36px">#</th>
          <th>Description</th>
          <th class="r" style="width:56px">Qty</th>
          <th class="c" style="width:56px">Unit</th>
          <th class="r" style="width:90px">Rate</th>
          <th class="r" style="width:100px">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <table class="totals"><tbody><tr><td>
      <table class="totals-inner">
        <tr><td class="lbl">Subtotal</td><td class="val">${formatCurrency(doc.subtotal, doc.currency)}</td></tr>
        <tr><td class="lbl">VAT</td><td class="val">${formatCurrency(doc.vatAmount, doc.currency)}</td></tr>
        <tr class="grand"><td>Total</td><td class="val">${formatCurrency(doc.total, doc.currency)}</td></tr>
      </table>
    </td></tr></tbody></table>

    ${doc.notes ? `<div class="notes"><strong>Notes</strong><div style="margin-top:6px;white-space:pre-wrap;">${String(doc.notes).replace(/</g, "&lt;")}</div></div>` : ""}

    <div class="grow"></div>
    ${footerBlock}
  </section>
</body>
</html>`;
}

export async function generateSalesOrderPDF(order) {
  const headerDataUri = getQuotationHeaderDataUri();
  const footerDataUri = getQuotationFooterDataUri();
  const html = buildDocHTML(order, "order", { headerDataUri, footerDataUri });
  const browser = await launchBrowser();
  let page;
  try {
    page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    if (page) await page.close();
    await browser.close();
  }
}

export async function generateSalesInvoicePDF(invoice) {
  const headerDataUri = getQuotationHeaderDataUri();
  const footerDataUri = getQuotationFooterDataUri();
  const html = buildDocHTML(invoice, "invoice", { headerDataUri, footerDataUri });
  const browser = await launchBrowser();
  let page;
  try {
    page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    if (page) await page.close();
    await browser.close();
  }
}
