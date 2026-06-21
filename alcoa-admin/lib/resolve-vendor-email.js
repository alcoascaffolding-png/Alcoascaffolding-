import { connectDB } from "@/lib/db";
import Vendor from "@/models/Vendor";

/**
 * Resolve vendor email from a purchase document (PO or PI).
 */
export async function resolveVendorEmail(doc) {
  if (!doc) return null;

  const embedded =
    doc.vendor && typeof doc.vendor === "object" && doc.vendor.email
      ? String(doc.vendor.email).trim()
      : "";
  if (embedded) return embedded;

  const vendorId =
    doc.vendor && typeof doc.vendor === "object" && doc.vendor._id != null
      ? doc.vendor._id
      : doc.vendor;

  if (!vendorId) return null;

  await connectDB();
  const vendor = await Vendor.findById(vendorId).select("email companyName").lean();
  return vendor?.email ? String(vendor.email).trim() : null;
}
