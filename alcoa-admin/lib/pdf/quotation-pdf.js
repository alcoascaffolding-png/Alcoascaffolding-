import { launchBrowser } from "./chromium";
import {
  getQuotationCompanyName,
  getQuotationCompanyEmail,
  getQuotationLogoDataUri,
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
  return `${currency} ${Number(amount || 0).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function numberToWords(num) {
  if (!num || num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n) {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convert(n % 100) : "");
    if (n < 1000000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    return n.toLocaleString();
  }

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let result = convert(intPart) + " Dirhams";
  if (decPart > 0) result += ` and ${convert(decPart)} Fils`;
  return result;
}

function buildQuotationHTML(quotation, options = {}) {
  const { logoDataUri = "", headerDataUri = "", footerDataUri = "" } = options;
  const {
    quoteNumber = "",
    customerName = "",
    customerAddress = "",
    customerPhone = "",
    customerTRN = "",
    contactPersonName = "",
    subject = "",
    salesExecutive = "",
    preparedBy = "",
    paymentTerms = "Cash/CDC",
    deliveryTerms = "7-10 days from date of order",
    items = [],
    subtotal = 0,
    deliveryCharges = 0,
    installationCharges = 0,
    pickupCharges = 0,
    discount = 0,
    discountType = "fixed",
    vatPercentage = 5,
    vatAmount = 0,
    totalAmount = 0,
    currency = "AED",
    notes = "",
    termsAndConditions = "",
    bankDetails = {},
    quoteDate,
  } = quotation;

  const companyName = getQuotationCompanyName();
  const companyEmail = getQuotationCompanyEmail();
  const companyTRN = process.env.COMPANY_TRN || "100123456700003";
  const safeSubject = subject || `Quotation ${quoteNumber}`;
  const headerImageBlock = headerDataUri
    ? `<img class="header-art" src="${headerDataUri}" alt="Quotation header" crossorigin="anonymous" />`
    : `<div class="header-fallback">${logoDataUri ? `<img class="header-logo-fallback" src="${logoDataUri}" alt="" />` : ""}<div style="font-size:19px;font-weight:700;">${companyName.toUpperCase()}</div></div>`;
  const footerImageBlock = footerDataUri
    ? `<img class="footer-art" src="${footerDataUri}" alt="Quotation footer" crossorigin="anonymous" />`
    : `<div class="footer-fallback">For inquiries contact ${companyEmail}.</div>`;

  const defaultTerms = `
1. All prices quoted are in AED (UAE Dirhams) unless otherwise stated.
2. This quotation is valid for 30 days from the date of issue.
3. Payment terms: ${paymentTerms}.
4. Delivery terms: ${deliveryTerms}.
5. Equipment remains the property of ${companyName} until full payment is received.
6. The client is responsible for securing the equipment during the rental period.
7. Any damage to equipment will be charged to the client.
8. ${companyName} reserves the right to withdraw or revise this quotation without prior notice.`;

  const discountValue =
    discountType === "percentage" ? (subtotal * discount) / 100 : discount;
  const beforeVAT =
    subtotal +
    Number(deliveryCharges || 0) +
    Number(installationCharges || 0) +
    Number(pickupCharges || 0) -
    Number(discountValue || 0);
  const displaySubtotal = Math.max(0, Number(beforeVAT || 0));

  const FIRST_PAGE_ITEMS = 8;
  const OTHER_PAGE_ITEMS = 10;
  const itemPages = [];
  let cursor = 0;
  let startIndex = 0;

  if (!items.length) {
    itemPages.push({ chunk: [], startIndex: 0 });
  } else {
    while (cursor < items.length) {
      const pageSize = cursor === 0 ? FIRST_PAGE_ITEMS : OTHER_PAGE_ITEMS;
      const chunk = items.slice(cursor, cursor + pageSize);
      itemPages.push({ chunk, startIndex });
      cursor += chunk.length;
      startIndex += chunk.length;
    }
  }

  const renderRows = (pageItems, start) =>
    pageItems
      .map(
        (item, idx) => `
      <tr>
        <td class="center">${start + idx + 1}</td>
        <td>
          <div class="item-title">${item.equipmentType || ""}</div>
          ${item.description ? `<div class="item-sub">${item.description}</div>` : ""}
          ${item.specifications ? `<div class="item-sub">${item.specifications}</div>` : ""}
          ${item.size ? `<div class="item-sub">Size: ${item.size}</div>` : ""}
        </td>
        <td class="center">${Number(item.weight || 0).toFixed(2)}</td>
        <td class="center">${Number(item.cbm || 0).toFixed(2)}</td>
        <td class="center">${item.quantity || 0} ${item.unit || "Nos"}</td>
        <td class="right">${Number(item.ratePerUnit || 0).toFixed(2)}</td>
        <td class="right">${Number(item.taxableAmount ?? item.subtotal ?? 0).toFixed(2)}</td>
        <td class="center">${Number(item.vatPercentage ?? vatPercentage ?? 5)}</td>
        <td class="right">${Number(item.vatAmount || 0).toFixed(2)}</td>
        <td class="right strong">${Number(item.subtotal || 0).toFixed(2)}</td>
      </tr>`
      )
      .join("");

  const renderTable = (rows) => `
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:3%;">SN</th>
          <th style="width:50%;">Description of Goods</th>
          <th style="width:5%;">Wt (KG)</th>
          <th style="width:4%;">CBM</th>
          <th style="width:5%;">Qty</th>
          <th style="width:9%;">Rate<br>(AED)</th>
          <th style="width:8%;">Taxable Amount</th>
          <th style="width:3%;">VAT %</th>
          <th style="width:6%;">VAT Amount</th>
          <th style="width:8%;">Amount (AED)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  const itemSections = itemPages
    .map(({ chunk, startIndex }, pageIndex) => {
      const isFirst = pageIndex === 0;
      const isLastItemsPage = pageIndex === itemPages.length - 1;
      return `
      <section class="pdf-page ${isFirst ? "first-page " : ""}${isLastItemsPage ? "" : "page-break"}">
        ${isFirst ? `
        <div class="top-brand">${headerImageBlock}</div>
        <div class="doc-heading">
          <div class="doc-title">QUOTATION</div>
          <div class="doc-trn"><strong>TRN:</strong> ${companyTRN}</div>
        </div>
        <div class="head-grid">
          <div class="box">
            <table class="mini-table head-mini-table">
              <tr><td class="mini-label">Customer Name</td><td>${customerName || "-"}</td></tr>
              <tr><td class="mini-label">Address</td><td>${customerAddress || "-"}</td></tr>
              <tr><td class="mini-label">Mobile No</td><td>${customerPhone || "-"}</td></tr>
              <tr><td class="mini-label">TRN</td><td>${customerTRN || "-"}</td></tr>
              <tr><td class="mini-label">Contact Person</td><td>${contactPersonName || "-"}</td></tr>
            </table>
          </div>
          <div class="box">
            <table class="mini-table head-mini-table">
              <tr><td class="mini-label">Quotation No</td><td>${quoteNumber || "-"}</td></tr>
              <tr><td class="mini-label">Date</td><td>${formatDate(quoteDate)}</td></tr>
              <tr><td class="mini-label">Sales Executive</td><td>${salesExecutive || preparedBy || "-"}</td></tr>
              <tr><td class="mini-label">Payment Terms</td><td>${paymentTerms || "Cash/CDC"}</td></tr>
              <tr><td class="mini-label">Delivery Terms</td><td>${deliveryTerms || "-"}</td></tr>
            </table>
          </div>
        </div>
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${safeSubject}</div>
        ${renderTable(renderRows(chunk, startIndex))}
        </div>
        ` : renderTable(renderRows(chunk, startIndex))}
        ${isLastItemsPage ? `
          <div class="totals-wrap">
            <table class="totals-table">
              <tr><td class="label">Subtotal</td><td class="value">${displaySubtotal.toFixed(2)}</td></tr>
              <tr><td class="label">VAT (${vatPercentage}%)</td><td class="value">${Number(vatAmount || 0).toFixed(2)}</td></tr>
              <tr class="grand"><td class="label">Total (${currency})</td><td class="value">${Number(totalAmount || 0).toFixed(2)}</td></tr>
            </table>
          </div>
          <div class="amount-words">AMOUNT IN WORDS: ${numberToWords(totalAmount)} ONLY</div>
        ` : ""}
        <div class="footer-main">${footerImageBlock}</div>
      </section>`;
    })
    .join("");

  const bankSection = `
    <div class="box bank-box">
      <div class="box-title">BANK DETAILS</div>
      <table class="mini-table">
        <tr><td class="mini-label">Bank Name</td><td>${bankDetails.bankName || "-"}</td></tr>
        <tr><td class="mini-label">Account Name</td><td>${bankDetails.accountName || "-"}</td></tr>
        <tr><td class="mini-label">Account Number</td><td>${bankDetails.accountNumber || "-"}</td></tr>
        <tr><td class="mini-label">IBAN</td><td>${bankDetails.iban || "-"}</td></tr>
        <tr><td class="mini-label">SWIFT</td><td>${bankDetails.swiftCode || "-"}</td></tr>
      </table>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${quoteNumber}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --layout-blue: #235aa0;
      --layout-blue-soft: #edf4fc;
      --layout-blue-wash: #dbe8f6;
    }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #111; line-height: 1.35; }
    /* Bleed header art to the inner edge of the page frame (matches .footer-main). */
    .top-brand {
      width: calc(100% + 12mm - 6px);
      margin-left: calc(-6mm + 3px);
      margin-right: calc(-6mm + 3px);
      margin-bottom: 6px;
    }
    .header-art, .footer-art { width: 100%; height: auto; display: block; object-fit: contain; }
    .header-fallback { border-bottom: 2px solid #2a5f9e; min-height: 56px; position: relative; padding: 6px 0; text-align: center; }
    .header-logo-fallback { position: absolute; left: 0; top: 4px; height: 48px; max-width: 165px; object-fit: contain; }
    .footer-fallback { border: 1px solid #9ca3af; padding: 5px 6px; text-align: center; }
    /* Every printed A4 page gets an inset frame border via ::before.
       Outer space (page edge -> frame) = 6mm.
       Inner padding (frame -> content) = 6mm. Total page padding = 12mm. */
    .pdf-page {
      min-height: 297mm;
      padding: 12mm 12mm calc(6mm + 3px);
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .pdf-page::before {
      content: "";
      position: absolute;
      top: 6mm;
      left: 6mm;
      right: 6mm;
      bottom: 6mm;
      border: 3px solid var(--layout-blue);
      pointer-events: none;
    }
    /* Match top inset to left/right (12mm) so the gap above the header matches the side margins. */
    .first-page { padding-top: 7mm; }
    .first-page .top-brand {
      margin-top: 0;
      margin-bottom: 2px;
    }
    .page-break { page-break-after: always; break-after: page; }
    .doc-heading { text-align: center; margin: 6px 0 8px; }
    .doc-title { margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.4px; color: #111; line-height: 1; }
    .doc-trn { margin-top: 4px; font-size: 10px; color: #111; line-height: 1.1; }
    .doc-trn strong { font-weight: 700; }
    .head-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 8px;
      margin-bottom: 8px;
      align-items: stretch;
    }
    .box { border: 1px solid #222; }
    .head-grid .box {
      border: 0; /* outer border comes from the table so we never get a double line under the last row */
      min-height: 0;
      height: 100%;
    }
    /* Larger header info tables (customer + quotation) — only these two blocks */
    .head-mini-table {
      width: 100%;
      border: 2px solid #111;
      border-collapse: collapse;
      table-layout: auto;
      height: 100%;
    }
    .head-mini-table tr { height: 20%; }
    .head-mini-table td {
      border: 1px solid #222;
      padding: 8px 10px;
      font-size: 11px;
      line-height: 1.25;
      vertical-align: top;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .head-mini-table .mini-label {
      width: 128px;
      min-width: 128px;
      font-weight: 700;
      background: #e8eaee;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.02em;
      padding: 8px 10px;
      white-space: nowrap;
    }
    .mini-table { width: 100%; border-collapse: collapse; }
    .mini-table td { border: 1px solid #222; padding: 4px 5px; font-size: 9px; vertical-align: top; }
    .mini-table .mini-label { width: 110px; font-weight: 700; background: #f3f4f6; text-transform: uppercase; font-size: 8.5px; }
    /* Outer frame for subject + line items (same 2px as header tables) */
    .doc-lines-shell {
      border: 2px solid #111;
      margin-top: 4px;
    }
    .doc-lines-shell .subject-bar {
      border: none;
      border-bottom: 1px solid #222;
      padding: 8px 10px;
      font-size: 9px;
      margin: 0;
    }
    .doc-lines-shell .items-table {
      border: none;
    }
    .subject-bar { border: 2px solid #111; border-bottom: none; padding: 8px 10px; font-size: 9px; margin-top: 4px; }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      border: 2px solid #111;
    }
    .items-table thead { display: table-header-group; }
    .items-table th, .items-table td { border: 1px solid #222; padding: 3px 4px; font-size: 8.7px; vertical-align: top; }
    .items-table th { font-weight: 700; background: #f3f4f6; text-align: center; }
    .items-table td.center { text-align: center; } .items-table td.right { text-align: right; } .items-table td.strong { font-weight: 700; }
    .item-title { font-weight: 700; } .item-sub { color: #374151; }
    .totals-wrap { margin-top: 6px; width: 100%; border: 2px solid #111; page-break-inside: avoid; }
    .totals-table { width: 100%; border-collapse: collapse; }
    .totals-table td { border: 1px solid #222; padding: 4px 6px; font-size: 9px; }
    .totals-table .label { font-weight: 700; text-transform: uppercase; } .totals-table .value { text-align: right; }
    .totals-table .grand td { font-weight: 700; background: #e5ecf8; }
    .amount-words {
      border: 2px solid #111;
      margin-top: 6px;
      padding: 10px 12px;
      font-size: 9px;
      font-weight: 700;
    }
    .last-page {
      display: flex;
      flex-direction: column;
      /* Less bottom padding than other pages so the footer art sits closer to the frame (was 12mm from .pdf-page). */
      padding-bottom: calc(6mm + 3px);
    }
    .closing-pack {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }
    /* Center bank-details + signatures vertically between Terms and Footer. */
    .bottom-pack { margin-top: auto; margin-bottom: auto; }
    .lower-grid { display: block; margin-top: 4px; }
    .terms-plain { padding-top: 2px; }
    .terms-plain-title { font-size: 14px; font-weight: 700; color: var(--layout-blue); text-decoration: underline; margin-bottom: 6px; }
    .terms-plain-body { font-size: 9.5px; line-height: 1.55; white-space: pre-line; }
    .notes-plain { margin-top: 6px; border-top: 1px solid #d1d5db; padding-top: 4px; font-size: 9.5px; line-height: 1.5; }
    .notes-plain strong { color: var(--layout-blue); text-decoration: underline; }
    /* Bank details — centered medium-sized table with its own header bar */
    .bank-block { margin-top: 14px; }
    .bank-title-main { text-align: center; font-size: 14px; color: #111; text-decoration: underline; font-weight: 700; margin-bottom: 8px; }
    .bank-table-wrap { display: flex; justify-content: center; }
    .bank-table-full {
      width: 72%;
      border-collapse: collapse;
      border: 1px solid #1f3b6d;
    }
    .bank-table-full caption {
      caption-side: top;
      text-align: left;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.02em;
      padding: 5px 8px;
      background: #f3f4f6;
      border: 1px solid #1f3b6d;
      border-bottom: none;
    }
    .bank-table-full td { font-size: 9.5px; padding: 6px 9px; border: 1px solid #1f3b6d; }
    .bank-table-full .mini-label { width: 38%; font-weight: 700; background: #fafcff; color: inherit; text-transform: none; }
    /* Signature row */
    .sign-row { margin-top: 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
    .sign-box { text-align: center; font-size: 10px; color: var(--layout-blue); font-weight: 700; }
    .sign-line { width: 65%; margin: 10px auto 0; height: 38px; border-bottom: 1px solid var(--layout-blue); }
    /* Bleed footer art to the inner edge of the page frame (::before is inset 6mm; content padding 12mm). */
    .footer-main {
      width: calc(100% + 12mm - 6px);
      margin-left: calc(-6mm + 3px);
      margin-right: calc(-6mm + 3px);
      margin-top: auto;
      margin-bottom: 0;
      line-height: 0;
      font-size: 0;
    }
  </style>
</head>
<body>
  ${itemSections}

  <section class="pdf-page last-page">
    <div class="closing-pack">
      <div class="lower-grid">
        <div class="terms-plain">
          <div class="terms-plain-title">Terms &amp; Conditions</div>
          <div class="terms-plain-body">${(termsAndConditions || defaultTerms).replace(/\n/g, "<br>")}</div>
        </div>
      </div>
      ${notes ? `<div class="notes-plain"><strong>Notes:</strong> ${notes.replace(/\n/g, "<br>")}</div>` : ""}
      <div class="bottom-pack">
        <div class="bank-block">
          <div class="bank-title-main">BANK DETAILS</div>
          <div class="bank-table-wrap">
            <table class="bank-table-full">
              <tr><td class="mini-label">Bank Name</td><td>${bankDetails.bankName || "-"}</td></tr>
              <tr><td class="mini-label">AccountName</td><td>${bankDetails.accountName || "-"}</td></tr>
              <tr><td class="mini-label">AccountNumber</td><td>${bankDetails.accountNumber || "-"}</td></tr>
              <tr><td class="mini-label">IBAN</td><td>${bankDetails.iban || "-"}</td></tr>
              <tr><td class="mini-label">SWIFT</td><td>${bankDetails.swiftCode || "-"}</td></tr>
            </table>
          </div>
        </div>
        <div class="sign-row">
          <div class="sign-box"><div>For ALCOA ALUMINIUM SCAFFOLDING</div><div class="sign-line"></div></div>
          <div class="sign-box"><div>CUSTOMER'S SIGNATURE</div><div class="sign-line"></div></div>
        </div>
      </div>
    </div>
    <div class="footer-main">${footerImageBlock}</div>
  </section>
</body>
</html>`;
}

/**
 * Generate a PDF buffer for a quotation
 * @param {Object} quotation - Mongoose document or plain object
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateQuotationPDF(quotation) {
  const logoDataUri = getQuotationLogoDataUri();
  const headerDataUri = getQuotationHeaderDataUri();
  const footerDataUri = getQuotationFooterDataUri();
  const html = buildQuotationHTML(quotation, {
    logoDataUri,
    headerDataUri,
    footerDataUri,
  });

  const browser = await launchBrowser();
  let page;
  try {
    page = await browser.newPage();
    // Avoid "networkidle" on serverless: Google Fonts and other subresources can prevent
    // idle from ever settling, causing timeouts on Vercel.
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
