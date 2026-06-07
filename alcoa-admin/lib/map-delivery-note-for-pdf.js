import { formatCustomerAddressFromRecord } from "@/lib/map-sales-order-for-quotation-pdf";

/**
 * Maps a delivery note into the delivery-note PDF layout shape.
 */
export function mapDeliveryNoteForPdf(note) {
  const cust = note.customer && typeof note.customer === "object" ? note.customer : null;
  const salesOrder =
    note.salesOrder && typeof note.salesOrder === "object" ? note.salesOrder : null;

  const customerAddress = note.customerAddress || formatCustomerAddressFromRecord(cust);

  return {
    deliveryNoteNumber: note.deliveryNoteNumber,
    salesOrderNumber: salesOrder?.orderNumber || note.salesOrderNumber || "",
    customerName: note.customerName,
    customerAddress,
    customerPhone: note.customerPhone || cust?.primaryPhone || "",
    deliveryAddress: note.deliveryAddress || customerAddress,
    contactPersonName: note.contactPersonName || "",
    contactPersonPhone: note.contactPersonPhone || "",
    driverName: note.driverName || "",
    vehicleNumber: note.vehicleNumber || "",
    deliveryDate: note.deliveryDate,
    noteDate: note.createdAt || note.deliveryDate,
    notes: note.notes || "",
    deliveryInstructions: note.deliveryInstructions || "",
    items: (note.items || []).map((it) => ({
      description: it.description || it.equipmentType || "",
      equipmentType: it.equipmentType || it.description || "",
      specifications: it.specifications || "",
      size: it.size || "",
      weight: Number(it.weight) || 0,
      cbm: Number(it.cbm) || 0,
      quantity: Number(it.quantity) || 0,
      unit: it.unit || "Nos",
    })),
  };
}

/** Display mapping for admin detail table (no pricing). */
export function mapDeliveryNoteItemsForDisplay(note) {
  return (note.items || []).map((it) => ({
    ...it,
    equipmentType: it.equipmentType || it.description || "",
  }));
}
