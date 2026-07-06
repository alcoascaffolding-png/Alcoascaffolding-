import { redirect } from "next/navigation";

/** Legacy Settings URL → Inventory product categories */
export default function LegacyCategoriesRedirect() {
  redirect("/products/categories");
}
