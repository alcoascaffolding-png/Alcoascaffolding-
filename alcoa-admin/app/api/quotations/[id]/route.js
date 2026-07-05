import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import { applyQuotationPatch, normalizeQuotationPatchCustomer } from "@/lib/quotation-save";
import { ensureSalesOrderFromQuotation } from "@/lib/convert-quotation-to-sales-order";
import { ensureSalesInvoiceFromQuotation } from "@/lib/convert-quotation-to-invoice";
import {
  markQuotationConvertedFromSalesOrder,
  revertQuotationFromConvertedToApproved,
} from "@/lib/sync-quotation-sales-order";
import { Customer, Quotation } from "@/lib/mongoose-models";

void Customer;
import { getLinkedDocumentsForQuotation } from "@/lib/quotation-linked-documents";
import { resolveQuotationBankDetailsForPdf } from "@/lib/resolve-quotation-bank-details";
import { QUOTATION_CUSTOMER_POPULATE_FIELDS } from "@/lib/load-quotation-for-pdf";
import { assertQuotationSafeToDelete } from "@/lib/sales-document-delete-guards";
import { parseRequestBody } from "@/lib/validate-request";
import { quotationPatchSchema } from "@/lib/schemas/quotation";

export const GET = withErrorHandler(async (request, { params }) => {
  await authorizeApi("quotations", "read");

  await connectDB();
  const q = await Quotation.findById(params.id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .lean();
  if (!q) throw new AppError("Quotation not found", 404);
  const linked = await getLinkedDocumentsForQuotation(q._id, q.quoteNumber);
  const resolvedBankDetails = await resolveQuotationBankDetailsForPdf(q);
  return apiSuccess({ ...q, linked, resolvedBankDetails });
});

export const PATCH = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("quotations", "write");

  await connectDB();
  const rawBody = await request.json();
  const body = parseRequestBody(quotationPatchSchema, rawBody);

  const doc = await Quotation.findById(params.id);
  if (!doc) throw new AppError("Quotation not found", 404);

  const prevStatus = doc.status;
  const patchBody = await normalizeQuotationPatchCustomer(body, session.user.id);
  applyQuotationPatch(doc, patchBody);
  doc.lastModifiedBy = session.user.id;
  await doc.save();

  const nextStatus = doc.status;
  let conversion = null;

  if (
    ["converted", "converted_to_sales_order"].includes(nextStatus) &&
    !["converted", "converted_to_sales_order"].includes(prevStatus)
  ) {
    try {
      const result = await ensureSalesOrderFromQuotation(doc._id, session.user.id);
      conversion = {
        type: "sales_order",
        created: result.created,
        orderNumber: result.orderNumber,
        salesOrderId: String(result.salesOrder._id),
      };
    } catch (err) {
      await Quotation.findByIdAndUpdate(doc._id, {
        $set: { status: prevStatus, convertedToOrder: false },
        $unset: { convertedAt: "" },
      });
      throw err instanceof AppError
        ? err
        : new AppError(err.message || "Could not create sales order from quotation", 400);
    }
  } else if (
    ["converted", "converted_to_sales_order"].includes(prevStatus) &&
    !["converted", "converted_to_sales_order", "converted_to_invoice"].includes(nextStatus)
  ) {
    await revertQuotationFromConvertedToApproved(doc._id);
  } else if (["converted", "converted_to_sales_order"].includes(nextStatus)) {
    const result = await ensureSalesOrderFromQuotation(doc._id, session.user.id);
    conversion = {
      type: "sales_order",
      created: result.created,
      orderNumber: result.orderNumber,
      salesOrderId: String(result.salesOrder._id),
    };
  } else if (nextStatus === "converted_to_invoice") {
    try {
      const result = await ensureSalesInvoiceFromQuotation(doc._id, session.user.id);
      conversion = {
        type: "sales_invoice",
        created: result.created,
        invoiceNumber: result.invoiceNumber,
        salesInvoiceId: String(result.salesInvoice._id),
      };
    } catch (err) {
      await Quotation.findByIdAndUpdate(doc._id, {
        $set: { status: prevStatus, convertedToInvoice: false },
        $unset: { invoiceId: "" },
      });
      throw err instanceof AppError
        ? err
        : new AppError(err.message || "Could not create tax invoice from quotation", 400);
    }
  }

  const q = await Quotation.findById(params.id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .lean();

  const linked = await getLinkedDocumentsForQuotation(q._id, q.quoteNumber);
  const resolvedBankDetails = await resolveQuotationBankDetailsForPdf(q);
  const payload = { ...q, linked, resolvedBankDetails };
  if (conversion) payload.conversion = conversion;

  return apiSuccess(payload);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("quotations", "delete");

  await connectDB();
  await assertQuotationSafeToDelete(params.id);
  const q = await Quotation.findByIdAndDelete(params.id);
  if (!q) throw new AppError("Quotation not found", 404);
  return apiSuccess({ deleted: true });
});
