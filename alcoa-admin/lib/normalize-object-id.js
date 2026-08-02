import mongoose from "mongoose";

/**
 * Coerce optional ObjectId form/API values to a real ObjectId, or `undefined`
 * when empty / "__none__" / invalid — so Mongoose never sees `""`.
 */
export function normalizeOptionalObjectId(value) {
  if (value == null || value === "" || value === "__none__") return undefined;

  const id =
    typeof value === "object" && value !== null && value._id != null
      ? String(value._id)
      : String(value).trim();

  if (!id || id === "__none__" || !mongoose.Types.ObjectId.isValid(id)) {
    return undefined;
  }

  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return undefined;
  }
}
