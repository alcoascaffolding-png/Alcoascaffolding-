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

/** Dev launch flags — avoid --single-process on Windows (crashes / instant exit). */
function devChromiumLaunchOptions() {
  const isWin = process.platform === "win32";
  return {
    headless: true,
    args: isWin
      ? ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
      : [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--disable-gpu",
        ],
  };
}

/**
 * Launch a Chromium browser instance
 */
export async function launchBrowser() {
  const { chromium } = await import("playwright-core");
  // Sparticuz pack is Linux-only (Vercel). Do not use NODE_ENV=production on local Windows.
  const useSparticuz = Boolean(process.env.VERCEL);

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

  const baseOptions = devChromiumLaunchOptions();
  const executablePath = await getChromiumPath();
  const attempts = [];

  if (executablePath) {
    attempts.push(() =>
      chromium.launch({ ...baseOptions, executablePath })
    );
  }
  for (const channel of ["chrome", "msedge"]) {
    attempts.push(() => chromium.launch({ ...baseOptions, channel }));
  }

  let lastErr;
  for (const tryLaunch of attempts) {
    try {
      const browser = await tryLaunch();
      if (!browser.isConnected()) {
        await browser.close().catch(() => {});
        throw new Error("Chromium exited immediately after launch");
      }
      return browser;
    } catch (err) {
      lastErr = err;
      console.warn("[PDF] Chromium launch attempt failed:", err?.message);
    }
  }

  throw new Error(
    lastErr?.message ||
      "Chromium not found for PDF generation. Install Google Chrome, run `npx playwright install chromium`, or set CHROMIUM_EXECUTABLE_PATH."
  );
}
