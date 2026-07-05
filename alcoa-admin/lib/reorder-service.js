import Product from "@/models/Product";
import Vendor from "@/models/Vendor";

void Vendor;

/**
 * Pick the vendor that appears most often on reorder lines (for PO prefill).
 */
export function pickSuggestedVendorFromLines(lines = []) {
  const counts = new Map();

  for (const line of lines) {
    if (!line.preferredVendorId) continue;
    const id = String(line.preferredVendorId);
    const prev = counts.get(id);
    counts.set(id, {
      vendorId: id,
      vendorName: line.preferredVendorName || prev?.vendorName || "",
      count: (prev?.count || 0) + 1,
    });
  }

  if (!counts.size) return null;

  let best = null;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) best = entry;
  }

  return best ? { vendorId: best.vendorId, vendorName: best.vendorName } : null;
}

/**
 * Build purchase order line items from low/out-of-stock products.
 */
export async function buildLowStockReorderLines() {
  const products = await Product.find({
    isActive: { $ne: false },
    $or: [
      { currentStock: { $lte: 0 } },
      {
        $expr: {
          $and: [{ $gt: ["$minStock", 0] }, { $lte: ["$currentStock", "$minStock"] }],
        },
      },
    ],
  })
    .populate("preferredVendor", "companyName vendorCode")
    .sort({ currentStock: 1, name: 1 })
    .lean();

  const lines = products.map((p) => {
    const current = Number(p.currentStock) || 0;
    const reorder = Number(p.reorderLevel) || Number(p.minStock) || 0;
    const target =
      Number(p.maxStock) > 0
        ? Number(p.maxStock)
        : Math.max(reorder * 2, reorder + 10, 10);
    const quantity = Math.max(1, Math.ceil(target - current));
    const vendor = p.preferredVendor;

    return {
      product: String(p._id),
      description: p.name,
      quantity,
      unit: p.unit || "Nos",
      unitPrice: Number(p.purchasePrice) || 0,
      itemCode: p.itemCode,
      currentStock: current,
      minStock: Number(p.minStock) || 0,
      reorderLevel: reorder,
      preferredVendorId: vendor?._id ? String(vendor._id) : null,
      preferredVendorName: vendor?.companyName || null,
    };
  });

  return {
    lines,
    count: lines.length,
    suggestedVendor: pickSuggestedVendorFromLines(lines),
  };
}
