import mongoose from "mongoose";
import { Quotation, SalesOrder } from "@/lib/mongoose-models";
import { AppError } from "@/lib/api-error";
import { formatCustomerAddressFromRecord } from "@/lib/map-sales-order-for-quotation-pdf";

function formatDeliveryAddressFromQuotation(quotation) {
  const da = quotation?.deliveryAddress;
  if (!da) return "";
  return [da.addressLine1, da.addressLine2, da.area, da.city, da.emirate, da.landmark]
    .filter(Boolean)
    .join(", ");
}

function mergeQuotationItemFields(soItem, quoteItem) {
  if (!quoteItem) {
    return {
      description: soItem.description || "",
      equipmentType: soItem.description || "",
      specifications: "",
      size: "",
      weight: 0,
      cbm: 0,
      quantity: Number(soItem.quantity) || 0,
      unit: soItem.unit || "Nos",
    };
  }
  return {
    description: soItem.description || quoteItem.equipmentType || quoteItem.description || "",
    equipmentType: quoteItem.equipmentType || soItem.description || "",
    specifications: quoteItem.specifications || "",
    size: quoteItem.size || "",
    weight: Number(quoteItem.weight) || 0,
    cbm: Number(quoteItem.cbm) || 0,
    quantity: Number(soItem.quantity) || Number(quoteItem.quantity) || 0,
    unit: soItem.unit || quoteItem.unit || "Nos",
  };
}

function mapItemsFromOrder(order, quotation) {
  const soItems = Array.isArray(order.items) ? order.items : [];
  const quoteItems = Array.isArray(quotation?.items) ? quotation.items : [];
  return soItems.map((soItem, idx) => {
    const quoteItem =
      quoteItems[idx] ||
      quoteItems.find(
        (q) =>
          String(q.equipmentType || q.description || "")
            .trim()
            .toLowerCase() === String(soItem.description || "").trim().toLowerCase()
      );
    return mergeQuotationItemFields(soItem, quoteItem);
  });
}

/**
 * Build a delivery-note prefill payload from a sales order (no pricing).
 * @param {string} salesOrderId
 */
export async function buildDeliveryNotePrefillFromSalesOrder(salesOrderId) {
  if (!salesOrderId || !mongoose.Types.ObjectId.isValid(String(salesOrderId))) {
    throw new AppError("Invalid sales order id", 400);
  }

  const order = await SalesOrder.findById(salesOrderId)
    .populate("customer", "companyName addresses primaryPhone primaryEmail vatRegistrationNumber")
    .lean();
  if (!order) throw new AppError("Sales Order not found", 404);

  let quotation = null;
  if (order.quotation) {
    quotation = await Quotation.findById(order.quotation).lean();
  }

  const cust = order.customer && typeof order.customer === "object" ? order.customer : null;
  const customerAddress = order.customerAddress || formatCustomerAddressFromRecord(cust);
  const deliveryAddress =
    formatDeliveryAddressFromQuotation(quotation) || customerAddress || "";

  return {
    salesOrder: String(order._id),
    quotation: quotation ? String(quotation._id) : undefined,
    salesOrderNumber: order.orderNumber,
    customer: order.customer ? String(order.customer._id || order.customer) : undefined,
    customerName: order.customerName,
    customerEmail: order.customerEmail || cust?.primaryEmail || "",
    customerPhone: order.customerPhone || cust?.primaryPhone || "",
    customerAddress,
    deliveryAddress,
    deliveryDate: order.deliveryDate || order.orderDate,
    contactPersonName: quotation?.contactPersonName || "",
    contactPersonPhone: quotation?.contactPersonPhone || "",
    items: mapItemsFromOrder(order, quotation),
    notes: order.notes || "",
    deliveryInstructions: "",
    status: "draft",
  };
}
