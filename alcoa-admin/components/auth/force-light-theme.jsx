"use client";

import { useLayoutEffect } from "react";

/**
 * Keeps the login page visually light even when the user preference is dark.
 * Strips `.dark` from <html> for the lifetime of the login page.
 */
export function ForceLightTheme() {
  useLayoutEffect(() => {
    const root = document.documentElement;

    const applyLight = () => {
      if (root.classList.contains("dark")) {
        root.classList.remove("dark");
      }
      root.style.colorScheme = "light";
    };

    applyLight();

    const observer = new MutationObserver(applyLight);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "style"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
