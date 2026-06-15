import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { applyQuotationPatch, normalizeQuotationPatchCustomer } from "@/lib/quotation-save";
import { ensureSalesOrderFromQuotation } from "@/lib/convert-quotation-to-sales-order";
import {
  markQuotationConvertedFromSalesOrder,
  revertQuotationFromConvertedToApproved,
} from "@/lib/sync-quotation-sales-order";
import { Customer, Quotation } from "@/lib/mongoose-models";

void Customer;
import { getLinkedDocumentsForQuotation } from "@/lib/quotation-linked-documents";
import { QUOTATION_CUSTOMER_POPULATE_FIELDS } from "@/lib/load-quotation-for-pdf";

export const GET = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const q = await Quotation.findById(params.id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .lean();
  if (!q) throw new AppError("Quotation not found", 404);
  const linked = await getLinkedDocumentsForQuotation(q._id, q.quoteNumber);
  return apiSuccess({ ...q, linked });
});

export const PATCH = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();

  const doc = await Quotation.findById(params.id);
  if (!doc) throw new AppError("Quotation not found", 404);

  const prevStatus = doc.status;
  const patchBody = await normalizeQuotationPatchCustomer(body, session.user.id);
  applyQuotationPatch(doc, patchBody);
  doc.lastModifiedBy = session.user.id;
  await doc.save();

  const nextStatus = doc.status;
  let conversion = null;

  if (nextStatus === "converted" && prevStatus !== "converted") {
    try {
      const result = await ensureSalesOrderFromQuotation(doc._id, session.user.id);
      conversion = {
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
  } else if (prevStatus === "converted" && nextStatus !== "converted") {
    await revertQuotationFromConvertedToApproved(doc._id);
  } else if (nextStatus === "converted") {
    const result = await ensureSalesOrderFromQuotation(doc._id, session.user.id);
    conversion = {
      created: result.created,
      orderNumber: result.orderNumber,
      salesOrderId: String(result.salesOrder._id),
    };
  }

  const q = await Quotation.findById(params.id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .lean();

  const linked = await getLinkedDocumentsForQuotation(q._id, q.quoteNumber);
  const payload = { ...q, linked };
  if (conversion) payload.conversion = conversion;

  return apiSuccess(payload);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const q = await Quotation.findByIdAndDelete(params.id);
  if (!q) throw new AppError("Quotation not found", 404);
  return apiSuccess({ deleted: true });
});
