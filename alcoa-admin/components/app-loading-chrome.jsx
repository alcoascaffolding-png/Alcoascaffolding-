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
      color="#4f46e5"
      height={3}
      showSpinner={false}
      speed={200}
      shadow="0 0 10px #4f46e5,0 0 5px #4f46e5"
      zIndex={99998}
      crawlSpeed={200}
    />
  );
}
