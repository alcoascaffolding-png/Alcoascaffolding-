import SalesOrder from "@/models/SalesOrder";

/**
 * When a delivery note is marked delivered, advance linked sales order status.
 */
export async function syncSalesOrderOnDeliveryNote(prevSnapshot, nextDoc) {
  const soId = nextDoc.salesOrder;
  if (!soId) return;

  const prevDelivered = prevSnapshot?.status === "delivered";
  const nextDelivered = nextDoc.status === "delivered";
  const isReturn = nextDoc.noteType === "return";

  if (!prevDelivered && nextDelivered && !isReturn) {
    const so = await SalesOrder.findById(soId);
    if (!so) return;
    if (["draft", "confirmed", "in_progress"].includes(so.status)) {
      so.status = "delivered";
      await so.save();
    }
  }

  if (!prevDelivered && nextDelivered && isReturn) {
    const so = await SalesOrder.findById(soId);
    if (!so) return;
    if (["delivered", "in_progress", "confirmed"].includes(so.status)) {
      so.status = "completed";
      await so.save();
    }
  }
}
