import { AppError } from "@/lib/api-error";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Vendor from "@/models/Vendor";

export const DEFAULT_PRODUCT_CATEGORIES = [
  "Aluminium Scaffolding",
  "Steel Scaffolding",
  "Ladders",
  "Accessories",
  "Safety Equipment",
  "Other",
];

export const DEFAULT_VENDOR_CATEGORIES = [
  "Supplier",
  "Manufacturer",
  "Distributor",
  "Service Provider",
  "Other",
];

export function normalizeCategoryName(name) {
  return String(name || "").trim();
}

export function categoryNameKey(name) {
  return normalizeCategoryName(name).toLowerCase();
}

/**
 * Seed default categories when the collection is empty for a type.
 */
export async function ensureDefaultCategories(type) {
  const count = await Category.countDocuments({ type });
  if (count > 0) return;

  const names = type === "vendor" ? DEFAULT_VENDOR_CATEGORIES : DEFAULT_PRODUCT_CATEGORIES;
  const docs = names.map((name, index) => ({
    name,
    nameKey: categoryNameKey(name),
    type,
    sortOrder: index,
    isActive: true,
  }));

  await Category.insertMany(docs, { ordered: false }).catch(() => {
    /* race on parallel first requests */
  });
}

export async function listCategoryOptions(type, { activeOnly = true } = {}) {
  await ensureDefaultCategories(type);

  const filter = { type };
  if (activeOnly) filter.isActive = true;

  const items = await Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .select("name isActive sortOrder")
    .lean();

  return items.map((item) => ({
    value: item.name,
    label: item.name,
    isActive: item.isActive !== false,
  }));
}

export async function getActiveCategoryNames(type) {
  await ensureDefaultCategories(type);
  const items = await Category.find({ type, isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .select("name")
    .lean();
  return items.map((item) => item.name);
}

/**
 * Validate category string against active categories for a type.
 * Empty category is allowed for products.
 */
export async function assertValidCategory(type, name, { allowEmpty = false } = {}) {
  const normalized = normalizeCategoryName(name);
  if (!normalized) {
    if (allowEmpty) return undefined;
    throw new AppError("Category is required", 400);
  }

  await ensureDefaultCategories(type);
  const key = categoryNameKey(normalized);
  const doc = await Category.findOne({ type, nameKey: key, isActive: true }).lean();

  if (!doc) {
    const label = type === "vendor" ? "vendor" : "product";
    throw new AppError(
      `Invalid ${label} category "${normalized}". Add it under Settings → Categories or choose an existing one.`,
      400
    );
  }

  return doc.name;
}

export async function countCategoryUsage(type, name) {
  const normalized = normalizeCategoryName(name);
  if (!normalized) return 0;

  if (type === "vendor") {
    return Vendor.countDocuments({ category: normalized });
  }
  return Product.countDocuments({ category: normalized });
}

export function buildCategoryPayload(body) {
  const name = normalizeCategoryName(body.name);
  if (!name) throw new AppError("Category name is required", 400);

  return {
    name,
    nameKey: categoryNameKey(name),
    type: body.type,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    isActive: body.isActive !== false,
    description: body.description?.trim() || undefined,
  };
}
