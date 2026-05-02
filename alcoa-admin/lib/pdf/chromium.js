/**
 * Chromium bootstrap for Vercel serverless.
 *
 * - In production (Vercel): uses @sparticuz/chromium-min + playwright-core
 * - In development: uses playwright-core with locally installed Chromium
 *   (run `npx playwright install chromium` once)
 */

import fs from "node:fs";

let chromiumExecutablePath = null;

export async function getChromiumPath() {
  if (chromiumExecutablePath) return chromiumExecutablePath;

  // Allow explicit override via env (useful for Docker / self-hosted)
  if (process.env.CHROMIUM_EXECUTABLE_PATH) {
    chromiumExecutablePath = process.env.CHROMIUM_EXECUTABLE_PATH;
    return chromiumExecutablePath;
  }

  // In production on Vercel, use @sparticuz/chromium-min
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    try {
      const chromium = await import("@sparticuz/chromium-min");
      const chromiumMod = chromium.default || chromium;

      // If a tarball URL is set, use it; otherwise use the default CDN path
      if (process.env.CHROMIUM_TAR_URL) {
        chromiumExecutablePath = await chromiumMod.executablePath(process.env.CHROMIUM_TAR_URL);
      } else {
        chromiumExecutablePath = await chromiumMod.executablePath();
      }

      return chromiumExecutablePath;
    } catch (err) {
      console.error("[PDF] Failed to load @sparticuz/chromium-min:", err.message);
      throw new Error("Chromium not available. Install @sparticuz/chromium-min or set CHROMIUM_EXECUTABLE_PATH.");
    }
  }

  // Development: use playwright's bundled browser
  const { chromium } = await import("playwright-core");
  const candidatePath = chromium.executablePath();
  // Playwright may return a stale path when browser binaries are not installed.
  chromiumExecutablePath =
    candidatePath && fs.existsSync(candidatePath) ? candidatePath : null;
  return chromiumExecutablePath;
}

/**
 * Launch a Chromium browser instance
 */
export async function launchBrowser() {
  const executablePath = await getChromiumPath();
  const { chromium } = await import("playwright-core");

  const baseOptions = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  };

  // Preferred path (Playwright bundle or explicit CHROMIUM_EXECUTABLE_PATH)
  if (executablePath) {
    try {
      return await chromium.launch({
        ...baseOptions,
        executablePath,
      });
    } catch (err) {
      console.warn(
        "[PDF] Launch with executablePath failed, trying system browser channel:",
        err?.message
      );
    }
  }

  // Local development fallback: use installed Chrome/Edge when Playwright binaries are missing.
  for (const channel of ["chrome", "msedge"]) {
    try {
      return await chromium.launch({
        ...baseOptions,
        channel,
      });
    } catch {
      // Try the next channel.
    }
  }

  throw new Error(
    "Chromium not found for PDF generation. Run `npx playwright install chromium` or set CHROMIUM_EXECUTABLE_PATH."
  );
}
