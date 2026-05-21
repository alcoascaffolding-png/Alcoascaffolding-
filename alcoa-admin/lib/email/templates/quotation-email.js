import {
  QUOTATION_BRAND,
  getQuotationCompanyName,
  getQuotationTagline,
  getQuotationCompanyEmail,
} from "@/lib/quotation-brand";

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount, currency = "AED") {
  return `${currency} ${Number(amount || 0).toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Professional cover email for a quotation. Full line items and terms are in the PDF attachment only.
 */
export default function quotationEmailTemplate(quotation, options = {}) {
  const { logoCid = "", logoUrl = "", logoDataUri = "" } = options;
  const b = QUOTATION_BRAND;
  const companyName = getQuotationCompanyName();
  const tagline = getQuotationTagline();
  const companyEmail = getQuotationCompanyEmail();

  const {
    quoteNumber,
    customerName,
    quoteDate,
    validUntil,
    subject = "",
    salesExecutive,
    preparedBy,
    totalAmount = 0,
  } = quotation;

  const logoSrc = logoCid ? `cid:${logoCid}` : logoUrl || logoDataUri;
  const logoImg = logoSrc
    ? `<img src="${logoSrc}" alt="${escapeHtml(companyName)}" width="160" height="56" style="height:56px;width:auto;max-width:180px;object-fit:contain;display:block;background:#ffffff;padding:6px 10px;border-radius:6px;" />`
    : "";

  const contactName = salesExecutive || preparedBy || companyName;
  const safeCustomer = escapeHtml(customerName);
  const safeSubject = escapeHtml(subject);
  const safeQuote = escapeHtml(quoteNumber);
  const safeContact = escapeHtml(contactName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${safeQuote}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:${b.text};margin:0;padding:24px 12px;background:#e8eef5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(29,58,108,0.12);border:1px solid ${b.accentBorder};">
    <div style="background:${b.headerGradient};color:#fff;padding:22px 24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle;">
            ${logoImg}
            <div style="font-size:18px;font-weight:700;letter-spacing:0.02em;margin-top:${logoImg ? "12px" : "0"};">${companyName}</div>
            <div style="font-size:11px;opacity:0.92;margin-top:4px;font-weight:500;">${tagline}</div>
          </td>
          <td style="vertical-align:middle;text-align:right;width:140px;">
            <div style="font-size:10px;opacity:0.92;letter-spacing:0.12em;font-weight:600;">QUOTATION</div>
            <div style="font-size:17px;font-weight:700;margin-top:2px;">${safeQuote}</div>
          </td>
        </tr>
      </table>
    </div>

    <div style="padding:28px 24px 24px;">
      <p style="margin:0 0 16px;font-size:15px;color:${b.text};">Dear ${safeCustomer},</p>

      <p style="margin:0 0 16px;font-size:14px;color:${b.text};line-height:1.65;">
        Thank you for your interest in ${companyName}. Please find attached our formal quotation
        <strong>${safeQuote}</strong> in PDF format for your review.
      </p>

      ${safeSubject ? `<p style="margin:0 0 16px;font-size:14px;color:${b.muted};line-height:1.55;"><strong style="color:${b.text};">Re:</strong> ${safeSubject}</p>` : ""}

      <table style="width:100%;border-collapse:collapse;margin:0 0 20px;background:${b.accentWash};border:1px solid ${b.accentBorder};border-radius:8px;">
        <tr>
          <td style="padding:14px 16px;font-size:13px;color:${b.muted};width:42%;">Quote date</td>
          <td style="padding:14px 16px;font-size:13px;font-weight:600;text-align:right;">${formatDate(quoteDate)}</td>
        </tr>
        <tr>
          <td style="padding:0 16px 14px;font-size:13px;color:${b.muted};">Valid until</td>
          <td style="padding:0 16px 14px;font-size:13px;font-weight:600;text-align:right;color:#dc2626;">${formatDate(validUntil)}</td>
        </tr>
        <tr>
          <td style="padding:0 16px 14px;font-size:13px;color:${b.muted};">Quoted amount</td>
          <td style="padding:0 16px 14px;font-size:14px;font-weight:700;text-align:right;color:${b.primary};">${formatCurrency(totalAmount)}</td>
        </tr>
      </table>

      <p style="margin:0 0 16px;font-size:14px;color:${b.text};line-height:1.65;">
        The attached PDF contains the full item breakdown, terms, and conditions. If you have any questions
        or would like to proceed, please reply to this email or contact us at
        <a href="mailto:${companyEmail}" style="color:${b.primary};font-weight:600;text-decoration:none;">${companyEmail}</a>.
      </p>

      <p style="margin:0;font-size:14px;color:${b.text};">
        Kind regards,<br>
        <strong>${safeContact}</strong><br>
        <span style="color:${b.muted};font-size:13px;">${companyName}</span>
      </p>
    </div>

    <div style="background:${b.footerBg};color:#e2e8f0;padding:18px 24px;text-align:center;font-size:12px;">
      <p style="margin:4px 0;font-weight:700;color:#fff;">${companyName}</p>
      <p style="margin:4px 0;"><a href="mailto:${companyEmail}" style="color:#c7d2fe;text-decoration:none;">${companyEmail}</a></p>
    </div>
  </div>
</body>
</html>`;
}
