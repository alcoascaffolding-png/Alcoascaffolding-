import {
  QUOTATION_BRAND,
  getQuotationCompanyName,
  getQuotationTagline,
  getQuotationCompanyEmail,
  getQuotationCompanyTRN,
} from "@/lib/quotation-brand";

export function formatEmailDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatEmailCurrency(amount, currency = "AED") {
  return `${currency} ${Number(amount || 0).toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function escapeEmailHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Professional cover email (quotation / sales order / sales invoice).
 * Full line items and terms are in the PDF attachment only.
 *
 * @param {{
 *   docTypeLabel: string;
 *   docNumber: string;
 *   pageTitle: string;
 *   customerName: string;
 *   subject?: string;
 *   contactName?: string;
 *   introHtml: string;
 *   bodyHtml?: string;
 *   summaryRows: { label: string; value: string; valueStyle?: string }[];
 *   logoSrc?: string;
 * }} config
 */
export function buildDocumentCoverEmail(config) {
  const {
    docTypeLabel,
    docNumber,
    pageTitle,
    customerName,
    subject = "",
    contactName,
    introHtml,
    bodyHtml = "",
    summaryRows,
    logoSrc = "",
  } = config;

  const b = QUOTATION_BRAND;
  const companyName = getQuotationCompanyName();
  const tagline = getQuotationTagline();
  const companyEmail = getQuotationCompanyEmail();
  const companyTrn = getQuotationCompanyTRN();
  const safeCompanyName = escapeEmailHtml(companyName);
  const safeContact = escapeEmailHtml(contactName || companyName);
  const logoImg = logoSrc
    ? `<img src="${logoSrc}" alt="${escapeEmailHtml(companyName)}" width="160" height="56" style="height:56px;width:auto;max-width:180px;object-fit:contain;display:block;background:#ffffff;padding:6px 10px;border-radius:6px;" />`
    : "";

  const safeCustomer = escapeEmailHtml(customerName);
  const safeSubject = escapeEmailHtml(subject);
  const safeDocNumber = escapeEmailHtml(docNumber);
  const safeDocLabel = escapeEmailHtml(docTypeLabel);

  const summaryTableRows = summaryRows
    .map(
      (row, index) => `
        <tr>
          <td style="padding:${index === 0 ? "14px" : "0"} 16px ${index === summaryRows.length - 1 ? "14px" : "14px"};font-size:14px;color:${b.muted};width:42%;">${escapeEmailHtml(row.label)}</td>
          <td style="padding:${index === 0 ? "14px" : "0"} 16px ${index === summaryRows.length - 1 ? "14px" : "14px"};font-size:14px;font-weight:600;text-align:right;${row.valueStyle || ""}">${row.value}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeEmailHtml(pageTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:${b.text};margin:0;padding:24px 12px;background:#e8eef5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(29,58,108,0.12);border:1px solid ${b.accentBorder};">
    <div style="background:${b.footerBg};color:#fff;padding:22px 24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle;">
            ${logoImg}
            <div style="font-size:18px;font-weight:700;letter-spacing:0.02em;margin-top:${logoImg ? "12px" : "0"};">${safeCompanyName}</div>
            <div style="font-size:11px;opacity:0.92;margin-top:4px;font-weight:500;">${tagline}</div>
          </td>
          <td style="vertical-align:middle;text-align:right;width:140px;">
            <div style="font-size:10px;opacity:0.92;letter-spacing:0.12em;font-weight:600;">${safeDocLabel}</div>
            <div style="font-size:17px;font-weight:700;margin-top:2px;">${safeDocNumber}</div>
          </td>
        </tr>
      </table>
    </div>

    <div style="padding:28px 24px 24px;">
      <p style="margin:0 0 16px;font-size:16px;color:${b.text};">Dear ${safeCustomer},</p>

      ${introHtml}

      ${safeSubject ? `<p style="margin:0 0 16px;font-size:14px;color:${b.muted};line-height:1.6;"><strong style="color:${b.text};">Subject:</strong> ${safeSubject}</p>` : ""}

      <table style="width:100%;border-collapse:collapse;margin:0 0 20px;background:${b.accentWash};border:1px solid ${b.accentBorder};border-radius:8px;">
        ${summaryTableRows}
      </table>

      ${bodyHtml}

      <p style="margin:0 0 16px;font-size:15px;color:${b.text};line-height:1.7;">
        The attached PDF includes the complete line-item breakdown, commercial terms, and bank details for
        <strong>${safeCompanyName}</strong>. Should you require any clarification or wish to proceed, please reply
        to this email or contact us at
        <a href="mailto:${companyEmail}" style="color:${b.primary};font-weight:600;text-decoration:none;">${companyEmail}</a>.
      </p>

      <p style="margin:0 0 4px;font-size:14px;color:${b.text};line-height:1.6;">
        Thank you for your business.
      </p>
      <p style="margin:0;font-size:14px;color:${b.text};">
        Yours sincerely,<br>
        <strong>${safeContact}</strong><br>
        <span style="color:${b.muted};font-size:13px;">${safeCompanyName}</span>
      </p>
    </div>

    <div style="background:${b.footerBg};color:#e2e8f0;padding:18px 24px;text-align:center;font-size:12px;line-height:1.5;">
      <p style="margin:4px 0;font-weight:700;color:#fff;">${safeCompanyName}</p>
      <p style="margin:4px 0;opacity:0.9;">Manufacturers of Aluminium Scaffolding · Ladders · Steel Cuplock Scaffolding</p>
      <p style="margin:4px 0;opacity:0.85;">TRN: ${escapeEmailHtml(companyTrn)} · United Arab Emirates</p>
      <p style="margin:8px 0 4px;"><a href="mailto:${companyEmail}" style="color:#c7d2fe;text-decoration:none;">${companyEmail}</a></p>
    </div>
  </div>
</body>
</html>`;
}
