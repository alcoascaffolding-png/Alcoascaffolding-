"use client";

import NextTopLoader from "nextjs-toploader";

/**
 * Global loading feedback: top progress bar on App Router navigations
 * (soft / RSC transitions). Mutations use local UI (e.g. form overlay, button spinners)
 * so we do not stack a second global loader.
 */
export function AppLoadingChrome() {
  return (
    <NextTopLoader
      color="#1D3A6C"
      height={3}
      showSpinner={false}
      speed={200}
      shadow="0 0 10px #1D3A6C,0 0 5px #1D3A6C"
      zIndex={99998}
      crawlSpeed={200}
    />
  );
}
