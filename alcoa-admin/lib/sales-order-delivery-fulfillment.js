import mongoose from "mongoose";
import DeliveryNote from "@/models/DeliveryNote";
import SalesOrder from "@/models/SalesOrder";
import { AppError } from "@/lib/api-error";

const OPEN_OUTBOUND_STATUSES = ["draft", "ready", "dispatched", "in_transit"];

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Stable key for matching SO lines to DN lines.
 */
export function salesOrderLineKey(item, index = 0) {
  if (item?._id) return `line:${String(item._id)}`;
  if (item?.product) return `product:${String(item.product)}`;
  const label = normalizeText(item?.equipmentType || item?.description);
  if (label) return `desc:${label}`;
  return `idx:${index}`;
}

function matchDnItemToLineKey(dnItem, orderedByKey) {
  if (dnItem?.product) {
    const pid = String(dnItem.product);
    for (const [key, row] of Object.entries(orderedByKey)) {
      if (row.productId && String(row.productId) === pid) return key;
    }
  }
  const desc = normalizeText(dnItem?.equipmentType || dnItem?.description);
  if (desc) {
    for (const [key, row] of Object.entries(orderedByKey)) {
      if (normalizeText(row.description) === desc || normalizeText(row.equipmentType) === desc) {
        return key;
      }
    }
  }
  return null;
}

function emptyLineRow(meta) {
  return {
    ...meta,
    orderedQty: meta.orderedQty || 0,
    deliveredQty: 0,
    pendingQty: 0,
    returnedQty: 0,
    remainingQty: meta.orderedQty || 0,
  };
}

/**
 * Compute per-line delivery fulfillment for a sales order.
 */
export async function computeSalesOrderDeliveryFulfillment(salesOrderId, options = {}) {
  const { excludeDeliveryNoteId } = options;
  if (!salesOrderId || !mongoose.Types.ObjectId.isValid(String(salesOrderId))) {
    return { lines: [], summary: { totalOrdered: 0, totalDelivered: 0, totalRemaining: 0, fullyDelivered: true } };
  }

  const order = await SalesOrder.findById(salesOrderId).lean();
  if (!order) return null;

  const orderedByKey = {};
  (order.items || []).forEach((item, index) => {
    const key = salesOrderLineKey(item, index);
    orderedByKey[key] = {
      lineKey: key,
      lineIndex: index,
      description: item.description || item.equipmentType || "",
      equipmentType: item.equipmentType || item.description || "",
      unit: item.unit || "Nos",
      productId: item.product ? String(item.product) : null,
      orderedQty: Number(item.quantity) || 0,
      deliveredQty: 0,
      pendingQty: 0,
      returnedQty: 0,
      remainingQty: Number(item.quantity) || 0,
    };
  });

  const dnFilter = {
    salesOrder: order._id,
    status: { $ne: "cancelled" },
  };
  if (excludeDeliveryNoteId) {
    dnFilter._id = { $ne: excludeDeliveryNoteId };
  }

  const notes = await DeliveryNote.find(dnFilter).select("status noteType items").lean();

  for (const note of notes) {
    const isReturn = note.noteType === "return";
    const isDelivered = note.status === "delivered";
    const isOpenOutbound = !isReturn && OPEN_OUTBOUND_STATUSES.includes(note.status);

    for (const dnItem of note.items || []) {
      const key = matchDnItemToLineKey(dnItem, orderedByKey);
      if (!key) continue;
      const qty = Number(dnItem.quantity) || 0;
      if (qty <= 0) continue;

      if (isReturn) {
        if (isDelivered) orderedByKey[key].returnedQty += qty;
      } else if (isDelivered) {
        orderedByKey[key].deliveredQty += qty;
      } else if (isOpenOutbound) {
        orderedByKey[key].pendingQty += qty;
      }
    }
  }

  const lines = Object.values(orderedByKey).map((row) => {
    const netDelivered = row.deliveredQty - row.returnedQty;
    const remainingQty = Math.max(
      0,
      row.orderedQty - netDelivered - row.pendingQty
    );
    return {
      ...row,
      netDelivered,
      remainingQty,
      fullyDelivered: remainingQty <= 0.0001 && row.pendingQty <= 0.0001,
    };
  });

  const totalOrdered = lines.reduce((s, l) => s + l.orderedQty, 0);
  const totalDelivered = lines.reduce((s, l) => s + l.deliveredQty, 0);
  const totalReturned = lines.reduce((s, l) => s + l.returnedQty, 0);
  const totalPending = lines.reduce((s, l) => s + l.pendingQty, 0);
  const totalRemaining = lines.reduce((s, l) => s + l.remainingQty, 0);

  return {
    salesOrderId: String(order._id),
    orderNumber: order.orderNumber,
    lines,
    summary: {
      totalOrdered,
      totalDelivered,
      totalReturned,
      totalPending,
      totalRemaining,
      netDelivered: totalDelivered - totalReturned,
      fullyDelivered: totalRemaining <= 0.0001 && totalPending <= 0.0001,
      partiallyDelivered: totalDelivered > 0 && totalRemaining > 0.0001,
    },
  };
}

/**
 * Apply remaining quantities to prefill line items (outbound delivery only).
 */
export function applyRemainingQtyToPrefillItems(prefillItems, fulfillment) {
  if (!fulfillment?.lines?.length || !prefillItems?.length) return prefillItems;

  const remainingByKey = Object.fromEntries(
    fulfillment.lines.map((l) => [l.lineKey, l.remainingQty])
  );

  return prefillItems
    .map((item, index) => {
      const key = salesOrderLineKey(
        {
          _id: item._id,
          product: item.product,
          description: item.description,
          equipmentType: item.equipmentType,
        },
        index
      );
      let remaining = remainingByKey[key];
      if (remaining == null) {
        const desc = normalizeText(item.equipmentType || item.description);
        const match = fulfillment.lines.find(
          (l) =>
            normalizeText(l.description) === desc ||
            normalizeText(l.equipmentType) === desc
        );
        remaining = match?.remainingQty ?? item.quantity;
      }
      const qty = Math.max(0, Number(remaining) || 0);
      if (qty <= 0) return null;
      return { ...item, quantity: qty };
    })
    .filter(Boolean);
}

/**
 * Validate DN line quantities against SO fulfillment.
 */
export async function assertDeliveryNoteQuantitiesWithinSalesOrder({
  salesOrderId,
  noteType = "delivery",
  items = [],
  excludeDeliveryNoteId,
}) {
  if (!salesOrderId || noteType === "return") return;

  const fulfillment = await computeSalesOrderDeliveryFulfillment(salesOrderId, {
    excludeDeliveryNoteId,
  });
  if (!fulfillment) return;

  const proposedByKey = {};
  for (const [index, item] of items.entries()) {
    const key =
      matchDnItemToLineKey(item, Object.fromEntries(fulfillment.lines.map((l) => [l.lineKey, l]))) ||
      salesOrderLineKey(item, index);
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) continue;
    proposedByKey[key] = (proposedByKey[key] || 0) + qty;
  }

  const errors = [];
  for (const [key, proposedQty] of Object.entries(proposedByKey)) {
    const line = fulfillment.lines.find((l) => l.lineKey === key);
    if (!line) {
      errors.push(`A line item does not match the linked sales order.`);
      continue;
    }
    const allowed = line.remainingQty + 0.0001;
    if (proposedQty > allowed) {
      errors.push(
        `${line.description || line.equipmentType}: requested ${proposedQty} ${line.unit}, only ${line.remainingQty.toFixed(2)} remaining (ordered ${line.orderedQty}, delivered ${line.deliveredQty}, pending ${line.pendingQty}).`
      );
    }
  }

  if (errors.length) {
    throw new AppError(errors.join(" "), 400);
  }
}
