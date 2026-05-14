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

export default function salesInvoiceEmailTemplate(invoice, options = {}) {
  const { logoDataUri = "" } = options;
  const b = QUOTATION_BRAND;
  const companyName = getQuotationCompanyName();
  const tagline = getQuotationTagline();
  const companyEmail = getQuotationCompanyEmail();
  const balance =
    invoice.balance ?? Math.max(0, Number(invoice.total || 0) - Number(invoice.paidAmount || 0));

  const logoImg = logoDataUri
    ? `<img src="${logoDataUri}" alt="" width="132" height="52" style="height:52px;width:auto;max-width:160px;object-fit:contain;display:block;" />`
    : "";

  const itemRows = (invoice.items || [])
    .map(
      (item, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8fafc"};">
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">${item.description || ""}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:center;">${item.quantity} ${item.unit || "Nos"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;font-weight:600;">${formatCurrency(item.total, invoice.currency)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Invoice ${invoice.invoiceNumber}</title></head>
<body style="font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.55;color:${b.text};margin:0;padding:24px 12px;background:#e8eef5;">
  <div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(29,58,108,0.12);border:1px solid ${b.accentBorder};">
    <div style="background:${b.headerGradient};color:#fff;padding:22px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:16px;min-width:0;">
        ${logoImg}
        <div>
          <div style="font-size:18px;font-weight:700;">${companyName}</div>
          <div style="opacity:0.9;font-size:13px;">${tagline}</div>
        </div>
      </div>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 8px;font-size:15px;">Dear ${invoice.customerName},</p>
      <p style="margin:0 0 18px;color:${b.muted};">Please find your <strong>invoice</strong> below. A PDF copy is attached.</p>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:18px;font-size:13px;color:${b.muted};">
        <span><strong style="color:${b.text};">Invoice</strong> ${invoice.invoiceNumber}</span>
        <span>·</span>
        <span><strong style="color:${b.text};">Date</strong> ${formatDate(invoice.invoiceDate)}</span>
        ${invoice.dueDate ? `<span>·</span><span><strong style="color:${b.text};">Due</strong> ${formatDate(invoice.dueDate)}</span>` : ""}
        <span>·</span>
        <span><strong style="color:${b.text};">Status</strong> ${String(invoice.paymentStatus || "").replace(/_/g, " ")}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="text-align:left;padding:10px 12px;font-size:12px;color:${b.muted};">#</th>
            <th style="text-align:left;padding:10px 12px;font-size:12px;color:${b.muted};">Description</th>
            <th style="text-align:center;padding:10px 12px;font-size:12px;color:${b.muted};">Qty</th>
            <th style="text-align:right;padding:10px 12px;font-size:12px;color:${b.muted};">Rate</th>
            <th style="text-align:right;padding:10px 12px;font-size:12px;color:${b.muted};">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="margin-top:16px;text-align:right;font-size:14px;">
        <div><span style="color:${b.muted};">Subtotal</span> <strong>${formatCurrency(invoice.subtotal, invoice.currency)}</strong></div>
        <div><span style="color:${b.muted};">VAT</span> <strong>${formatCurrency(invoice.vatAmount, invoice.currency)}</strong></div>
        <div><span style="color:${b.muted};">Paid</span> <strong>${formatCurrency(invoice.paidAmount, invoice.currency)}</strong></div>
        <div style="margin-top:8px;font-size:16px;"><span style="color:${b.muted};">Balance due</span> <strong style="color:${b.primary};">${formatCurrency(balance, invoice.currency)}</strong></div>
      </div>
      ${invoice.notes ? `<p style="margin-top:20px;font-size:13px;color:${b.muted};white-space:pre-wrap;"><strong>Notes</strong><br/>${invoice.notes}</p>` : ""}
      <p style="margin-top:24px;font-size:13px;color:${b.muted};">Questions? Reply to this email or write to <a href="mailto:${companyEmail}" style="color:${b.primary};">${companyEmail}</a>.</p>
    </div>
  </div>
</body>
</html>`;
}
