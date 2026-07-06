"use client";

import { usePathname } from "next/navigation";
import { getBreadcrumbs, getPageTitle } from "@/lib/nav-labels";

export function usePageTitle() {
  const pathname = usePathname();
  return {
    pathname,
    title: getPageTitle(pathname),
    breadcrumbs: getBreadcrumbs(pathname),
  };
}
