"use client";

import { useQuery } from "@tanstack/react-query";
import { isFeatureEnabled } from "@/lib/utils";

async function fetchUiFeatures() {
  const res = await fetch("/api/config/features");
  const d = await res.json();
  if (!d.success) return { whatsapp: false, pdfEmail: false };
  return d.data;
}

/**
 * Server-driven WhatsApp availability (falls back to NEXT_PUBLIC_FEATURES via isFeatureEnabled).
 */
export function useShowWhatsApp() {
  const { data: uiFeatures } = useQuery({
    queryKey: ["ui-features"],
    queryFn: fetchUiFeatures,
    staleTime: 60_000,
  });
  return uiFeatures !== undefined ? Boolean(uiFeatures.whatsapp) : isFeatureEnabled("whatsapp");
}
