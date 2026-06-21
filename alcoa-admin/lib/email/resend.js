import { Resend } from "resend";
import {
  buildDocumentEmailBranding,
  getQuotationCompanyName,
} from "@/lib/quotation-brand";
import {
  contactCompanyTemplate,
  contactCustomerTemplate,
  quoteCompanyTemplate,
  quoteCustomerTemplate,
} from "./templates/contact";

let resendClient = null;

function getClient() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || "sales@alcoascaffolding.com";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || COMPANY_EMAIL;

function emailFromLine() {
  const name = getQuotationCompanyName();
  return `${name} <${FROM_EMAIL}>`;
}

async function sendEmail(options, retries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = getClient();
      const { data, error } = await client.emails.send(options);
      if (error) throw new Error(error.message || "Resend API error");
      return { success: true, messageId: data.id };
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, attempt * 2000));
      }
    }
  }
  throw lastError;
}

/** PDF attachment + optional Resend inline logo (contentId + base64 — not a separate file). */
function documentEmailAttachments(filename, pdfBuffer, inlineAttachments = []) {
  const attachments = [];

  for (const att of inlineAttachments) {
    if (!att?.contentId) continue;
    attachments.push({
      filename: att.filename || "quotation-logo.png",
      content: att.content,
      contentId: att.contentId,
      contentType: att.contentType || "image/png",
    });
  }

  if (pdfBuffer) {
    attachments.push({
      filename,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  }

  return attachments;
}

export async function sendContactFormEmail(data) {
  const [companyResult, customerResult] = await Promise.all([
    sendEmail({
      from: `Alcoa Scaffolding <${FROM_EMAIL}>`,
      to: [COMPANY_EMAIL],
      subject: `New Contact Inquiry from ${data.name}`,
      html: contactCompanyTemplate(data),
      reply_to: data.email,
    }),
    sendEmail({
      from: `Alcoa Scaffolding <${FROM_EMAIL}>`,
      to: [data.email],
      subject: "Thank You for Contacting Alcoa Scaffolding",
      html: contactCustomerTemplate(data),
      reply_to: COMPANY_EMAIL,
    }),
  ]);

  return {
    success: true,
    message: "Email sent successfully.",
    emailIds: { company: companyResult.messageId, customer: customerResult.messageId },
  };
}

export async function sendQuoteRequestEmail(data) {
  const [companyResult, customerResult] = await Promise.all([
    sendEmail({
      from: `Alcoa Scaffolding <${FROM_EMAIL}>`,
      to: [COMPANY_EMAIL],
      subject: `New Quote Request from ${data.name}`,
      html: quoteCompanyTemplate(data),
      reply_to: data.email,
    }),
    sendEmail({
      from: `Alcoa Scaffolding <${FROM_EMAIL}>`,
      to: [data.email],
      subject: "Your Quote Request Has Been Received",
      html: quoteCustomerTemplate(data),
      reply_to: COMPANY_EMAIL,
    }),
  ]);

  return {
    success: true,
    message: "Quote request submitted successfully.",
    emailIds: { company: companyResult.messageId, customer: customerResult.messageId },
  };
}

export async function sendQuotationEmail(quotation, pdfBuffer, options = {}) {
  const { default: quotationEmailTemplate } = await import("./templates/quotation-email");
  const { logoSrc, inlineAttachments } = buildDocumentEmailBranding();
  const html = quotationEmailTemplate(quotation, { logoSrc, ...options });

  const brandName = getQuotationCompanyName();
  return sendEmail({
    from: emailFromLine(),
    to: [quotation.customerEmail],
    cc: [COMPANY_EMAIL],
    subject: `Quotation ${quotation.quoteNumber} — ${brandName}`,
    html,
    attachments: documentEmailAttachments(
      `${quotation.quoteNumber}.pdf`,
      pdfBuffer,
      inlineAttachments
    ),
    reply_to: COMPANY_EMAIL,
  });
}

export async function sendSalesOrderEmail(order, pdfBuffer) {
  const { default: salesOrderEmailTemplate } = await import("./templates/sales-order-email");
  const { logoSrc, inlineAttachments } = buildDocumentEmailBranding();
  const html = salesOrderEmailTemplate(order, { logoSrc });

  const brandName = getQuotationCompanyName();
  return sendEmail({
    from: emailFromLine(),
    to: [order.customerEmail],
    cc: [COMPANY_EMAIL],
    subject: `Sales Order ${order.orderNumber} — ${brandName}`,
    html,
    attachments: documentEmailAttachments(
      `${order.orderNumber}.pdf`,
      pdfBuffer,
      inlineAttachments
    ),
    reply_to: COMPANY_EMAIL,
  });
}

export async function sendDeliveryNoteEmail(note, pdfBuffer) {
  const { default: deliveryNoteEmailTemplate } = await import("./templates/delivery-note-email");
  const { logoSrc, inlineAttachments } = buildDocumentEmailBranding();
  const html = deliveryNoteEmailTemplate(note, { logoSrc });

  const brandName = getQuotationCompanyName();
  return sendEmail({
    from: emailFromLine(),
    to: [note.customerEmail],
    cc: [COMPANY_EMAIL],
    subject: `Delivery Note ${note.deliveryNoteNumber} — ${brandName}`,
    html,
    attachments: documentEmailAttachments(
      `${note.deliveryNoteNumber}.pdf`,
      pdfBuffer,
      inlineAttachments
    ),
    reply_to: COMPANY_EMAIL,
  });
}

export async function sendSalesInvoiceEmail(invoice, pdfBuffer) {
  const { default: salesInvoiceEmailTemplate } = await import("./templates/sales-invoice-email");
  const { logoSrc, inlineAttachments } = buildDocumentEmailBranding();
  const html = salesInvoiceEmailTemplate(invoice, { logoSrc });

  const brandName = getQuotationCompanyName();
  return sendEmail({
    from: emailFromLine(),
    to: [invoice.customerEmail],
    cc: [COMPANY_EMAIL],
    subject: `Tax Invoice ${invoice.invoiceNumber} — ${brandName}`,
    html,
    attachments: documentEmailAttachments(
      `${invoice.invoiceNumber}.pdf`,
      pdfBuffer,
      inlineAttachments
    ),
    reply_to: COMPANY_EMAIL,
  });
}

export async function sendPurchaseOrderEmail(po, pdfBuffer) {
  const { default: purchaseOrderEmailTemplate } = await import("./templates/purchase-order-email");
  const { logoSrc, inlineAttachments } = buildDocumentEmailBranding();
  const html = purchaseOrderEmailTemplate(po, { logoSrc });

  const brandName = getQuotationCompanyName();
  return sendEmail({
    from: emailFromLine(),
    to: [po.vendorEmail],
    cc: [COMPANY_EMAIL],
    subject: `Purchase Order ${po.poNumber} — ${brandName}`,
    html,
    attachments: documentEmailAttachments(
      `${po.poNumber}.pdf`,
      pdfBuffer,
      inlineAttachments
    ),
    reply_to: COMPANY_EMAIL,
  });
}

export async function sendPurchaseInvoiceEmail(inv, pdfBuffer) {
  const { default: purchaseInvoiceEmailTemplate } = await import("./templates/purchase-invoice-email");
  const { logoSrc, inlineAttachments } = buildDocumentEmailBranding();
  const html = purchaseInvoiceEmailTemplate(inv, { logoSrc });

  const brandName = getQuotationCompanyName();
  return sendEmail({
    from: emailFromLine(),
    to: [inv.vendorEmail],
    cc: [COMPANY_EMAIL],
    subject: `Purchase Invoice ${inv.invoiceNumber} — ${brandName}`,
    html,
    attachments: documentEmailAttachments(
      `${inv.invoiceNumber}.pdf`,
      pdfBuffer,
      inlineAttachments
    ),
    reply_to: COMPANY_EMAIL,
  });
}
