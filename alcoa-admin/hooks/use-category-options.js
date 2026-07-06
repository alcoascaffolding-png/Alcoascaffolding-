"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchCategoryOptions(type) {
  const res = await fetch(`/api/categories/options?type=${type}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data.options || [];
}

/**
 * Active categories for product or vendor dropdowns.
 * @param {"product"|"vendor"} type
 */
export function useCategoryOptions(type) {
  return useQuery({
    queryKey: ["category-options", type],
    queryFn: () => fetchCategoryOptions(type),
    staleTime: 60_000,
  });
}
