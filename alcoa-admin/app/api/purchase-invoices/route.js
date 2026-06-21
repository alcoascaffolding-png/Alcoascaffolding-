import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { createListHandlers } from "@/lib/crud-factory";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import {
  generatePurchaseInvoiceNumber,
  recalculatePurchaseTotals,
} from "@/lib/purchase-service";
import { markOverduePurchaseInvoices } from "@/lib/mark-overdue-invoices";

const listGET = createListHandlers(() => import("@/models/PurchaseInvoice"), "Purchase Invoice", "purchase-invoices").GET;

export const GET = withErrorHandler(async (request) => {
  await connectDB();
  await markOverduePurchaseInvoices();
  return listGET(request);
});

function toObjectId(value) {
  if (value == null || value === "" || value === "__none__") return undefined;
  const s = String(value);
  if (!mongoose.Types.ObjectId.isValid(s)) return undefined;
  return new mongoose.Types.ObjectId(s);
}

const POST = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();

  if (!body.vendorName?.trim()) throw new AppError("Vendor name is required", 400);

  const { items, subtotal, vatAmount, total } = recalculatePurchaseTotals(body.items);
  if (!items.length) throw new AppError("At least one line item is required", 400);

  const doc = await PurchaseInvoice.create({
    invoiceNumber: body.invoiceNumber?.trim() || (await generatePurchaseInvoiceNumber(body.invoiceDate)),
    vendor: toObjectId(body.vendor),
    vendorName: body.vendorName.trim(),
    purchaseOrder: toObjectId(body.purchaseOrder),
    invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    paymentStatus: body.paymentStatus || "unpaid",
    items,
    subtotal,
    vatAmount,
    total,
    paidAmount: 0,
    balance: total,
    currency: body.currency || "AED",
    notes: body.notes,
    createdBy: session.user.id,
  });

  return apiSuccess(doc, 201);
});

export { POST };
