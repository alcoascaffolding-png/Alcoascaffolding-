import { Resend } from "resend";
import {
  getQuotationLogoBuffer,
  getQuotationLogoDataUri,
  getQuotationLogoPublicUrl,
  getQuotationCompanyName,
  QUOTATION_EMAIL_LOGO_CID,
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
  const logoBuffer = getQuotationLogoBuffer();
  const logoCid = logoBuffer ? QUOTATION_EMAIL_LOGO_CID : "";
  const logoUrl = logoCid ? "" : getQuotationLogoPublicUrl();
  const html = quotationEmailTemplate(quotation, { logoCid, logoUrl });
  const brandName = getQuotationCompanyName();

  const attachments = [];
  if (pdfBuffer) {
    attachments.push({ filename: `${quotation.quoteNumber}.pdf`, content: pdfBuffer });
  }
  if (logoBuffer) {
    attachments.push({
      filename: "quotation-logo.png",
      content: logoBuffer,
      contentId: QUOTATION_EMAIL_LOGO_CID,
    });
  }

  const result = await sendEmail({
    from: `Alcoa Scaffolding <${FROM_EMAIL}>`,
    to: [quotation.customerEmail],
    cc: [COMPANY_EMAIL],
    subject: `Quotation ${quotation.quoteNumber} — ${brandName}`,
    html,
    attachments,
    reply_to: COMPANY_EMAIL,
  });

  return result;
}

export async function sendSalesOrderEmail(order, pdfBuffer) {
  const { default: salesOrderEmailTemplate } = await import("./templates/sales-order-email");
  const logoDataUri = getQuotationLogoDataUri();
  const html = salesOrderEmailTemplate(order, { logoDataUri });
  const brandName = getQuotationCompanyName();
  const attachments = pdfBuffer
    ? [{ filename: `${order.orderNumber}.pdf`, content: pdfBuffer }]
    : [];
  return sendEmail({
    from: `Alcoa Scaffolding <${FROM_EMAIL}>`,
    to: [order.customerEmail],
    cc: [COMPANY_EMAIL],
    subject: `Sales Order ${order.orderNumber} — ${brandName}`,
    html,
    attachments,
    reply_to: COMPANY_EMAIL,
  });
}

export async function sendSalesInvoiceEmail(invoice, pdfBuffer) {
  const { default: salesInvoiceEmailTemplate } = await import("./templates/sales-invoice-email");
  const logoDataUri = getQuotationLogoDataUri();
  const html = salesInvoiceEmailTemplate(invoice, { logoDataUri });
  const brandName = getQuotationCompanyName();
  const attachments = pdfBuffer
    ? [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdfBuffer }]
    : [];
  return sendEmail({
    from: `Alcoa Scaffolding <${FROM_EMAIL}>`,
    to: [invoice.customerEmail],
    cc: [COMPANY_EMAIL],
    subject: `Invoice ${invoice.invoiceNumber} — ${brandName}`,
    html,
    attachments,
    reply_to: COMPANY_EMAIL,
  });
}
