/**
 * Chromium bootstrap for Vercel serverless.
 *
 * - In production / on Vercel: @sparticuz/chromium-min + playwright-core
 *   (must pass chromium.args and a pack tarball URL for -min; see Sparticuz docs.)
 * - In development: playwright-core with locally installed Chromium
 *   (run `npx playwright install chromium` once)
 */

import fs from "node:fs";

/**
 * Default pack for Linux x64 (Vercel). Keep major version aligned with
 * `@sparticuz/chromium-min` in package.json; override via CHROMIUM_TAR_URL.
 */
const SPARTICUZ_CHROMIUM_PACK_X64_TAR =
  "https://github.com/Sparticuz/chromium/releases/download/v147.0.0/chromium-v147.0.0-pack.x64.tar";

let localExecutablePathCache = null;

/**
 * Resolve Playwright-bundled Chromium path for local dev only.
 */
export async function getChromiumPath() {
  if (process.env.CHROMIUM_EXECUTABLE_PATH) {
    return process.env.CHROMIUM_EXECUTABLE_PATH;
  }

  if (localExecutablePathCache !== null) return localExecutablePathCache;

  const { chromium } = await import("playwright-core");
  const candidatePath = chromium.executablePath();
  localExecutablePathCache =
    candidatePath && fs.existsSync(candidatePath) ? candidatePath : null;
  return localExecutablePathCache;
}

/**
 * Launch a Chromium browser instance
 */
export async function launchBrowser() {
  const { chromium } = await import("playwright-core");
  const useSparticuz =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  if (useSparticuz) {
    const chromiumMod = await import("@sparticuz/chromium-min");
    const sc = chromiumMod.default ?? chromiumMod;

    if (typeof sc.setGraphicsMode === "function") {
      sc.setGraphicsMode(false);
    }

    const tarUrl = process.env.CHROMIUM_TAR_URL || SPARTICUZ_CHROMIUM_PACK_X64_TAR;

    let executablePath;
    try {
      executablePath = await sc.executablePath(tarUrl);
    } catch (err) {
      console.error("[PDF] @sparticuz/chromium-min executablePath failed:", err?.message);
      throw new Error(
        "Chromium not available. Set CHROMIUM_TAR_URL to a matching chromium-v*-pack.(x64|arm64).tar from Sparticuz releases, or set CHROMIUM_EXECUTABLE_PATH."
      );
    }

    const serverArgs = Array.isArray(sc.args) ? sc.args : [];

    try {
      return await chromium.launch({
        headless: true,
        args: serverArgs,
        executablePath,
      });
    } catch (err) {
      console.error("[PDF] Chromium launch failed:", err?.message);
      throw err;
    }
  }

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

  const executablePath = await getChromiumPath();

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
