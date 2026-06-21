#!/usr/bin/env node
/**
 * Integration test plan — HTTP API + lib syntax checks
 * Run: node scripts/test-plan-integration.mjs
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const AUTH_EMAIL =
  process.env.TEST_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@alcoascaffolding.ae";
const AUTH_PASSWORD =
  process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "Admin@1234";

/** @type {{ id: string; name: string; pass: boolean; detail: string }[]} */
const results = [];

function record(id, name, pass, detail = "") {
  results.push({ id, name, pass, detail });
  const tag = pass ? "PASS" : "FAIL";
  console.log(`[${tag}] ${id}: ${name}${detail ? ` — ${detail}` : ""}`);
}

function parseSetCookie(headerValue) {
  if (!headerValue) return [];
  const parts = Array.isArray(headerValue) ? headerValue : [headerValue];
  return parts.flatMap((h) =>
    h.split(/,(?=\s*[^;]+=[^;]+)/).map((c) => c.trim().split(";")[0]).filter(Boolean)
  );
}

function mergeCookies(existing, additions) {
  const jar = new Map();
  for (const c of [...parseSetCookie(existing), ...additions]) {
    const eq = c.indexOf("=");
    if (eq > 0) jar.set(c.slice(0, eq), c);
  }
  return [...jar.values()].join("; ");
}

async function login() {
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  if (!csrfRes.ok) {
    throw new Error(`CSRF fetch failed: ${csrfRes.status}`);
  }
  const { csrfToken } = await csrfRes.json();
  let cookieHeader = mergeCookies(csrfRes.headers.get("set-cookie"), []);

  const body = new URLSearchParams({
    csrfToken,
    email: AUTH_EMAIL,
    password: AUTH_PASSWORD,
    redirect: "false",
    json: "true",
  });

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader,
    },
    body,
    redirect: "manual",
  });

  const loginCookies =
    typeof loginRes.headers.getSetCookie === "function"
      ? loginRes.headers.getSetCookie()
      : parseSetCookie(loginRes.headers.get("set-cookie"));

  cookieHeader = mergeCookies(cookieHeader, loginCookies);

  if (![200, 302].includes(loginRes.status)) {
    const text = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${text.slice(0, 200)}`);
  }
  if (!cookieHeader.includes("authjs.session-token") && !cookieHeader.includes("__Secure-authjs.session-token")) {
    throw new Error("Login did not return session cookie (check TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD)");
  }

  return cookieHeader;
}

async function apiGet(pathname, cookie) {
  const res = await fetch(`${BASE_URL}${pathname}`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

function syntaxCheck(relativePath) {
  const abs = path.join(ROOT, relativePath);
  if (!fs.existsSync(abs)) {
    return { ok: false, detail: "file not found" };
  }
  const r = spawnSync(process.execPath, ["--check", abs], { encoding: "utf8" });
  if (r.status === 0) return { ok: true, detail: "syntax OK" };
  return { ok: false, detail: (r.stderr || r.stdout || "syntax error").trim().split("\n")[0] };
}

async function main() {
  console.log("=== alcoa-admin integration test plan ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Auth: credentials login (${AUTH_EMAIL}) — set TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD to override`);
  console.log("");

  let authCookie = null;
  let authNote = "";

  // TC1 — no auth
  try {
    const { status, json } = await apiGet("/api/health");
    const pass = status === 200 && json?.success === true && json?.data?.status === "ok";
    record("TC1", "GET /api/health returns 200", pass, pass ? `status=${status}` : `status=${status}, body=${JSON.stringify(json)?.slice(0, 120)}`);
  } catch (err) {
    record("TC1", "GET /api/health returns 200", false, err.message);
  }

  try {
    authCookie = await login();
    authNote = "Authenticated via NextAuth credentials (session cookie).";
    console.log(`[INFO] ${authNote}`);
  } catch (err) {
    authNote = `Auth unavailable: ${err.message}. Protected API tests may fail with 401.`;
    console.log(`[WARN] ${authNote}`);
  }
  console.log("");

  // TC2
  try {
    const { status, json } = await apiGet("/api/products/stats", authCookie);
    const pass =
      status === 200 && json?.success === true && json?.data && typeof json.data.total === "number";
    record(
      "TC2",
      "GET /api/products/stats returns success",
      pass,
      pass
        ? `total=${json.data.total}`
        : authCookie
          ? `status=${status}, ${JSON.stringify(json)?.slice(0, 120)}`
          : `requires auth cookie — ${authNote}`
    );
  } catch (err) {
    record("TC2", "GET /api/products/stats returns success", false, err.message);
  }

  // TC3
  try {
    const { status, json } = await apiGet("/api/purchase-orders/stats", authCookie);
    const d = json?.data;
    const pass =
      status === 200 &&
      json?.success === true &&
      d &&
      typeof d.total === "number" &&
      typeof d.received === "number";
    record(
      "TC3",
      "GET /api/purchase-orders/stats has total, received",
      pass,
      pass ? `total=${d.total}, received=${d.received}` : `status=${status}, data=${JSON.stringify(d)?.slice(0, 100)}`
    );
  } catch (err) {
    record("TC3", "GET /api/purchase-orders/stats has total, received", false, err.message);
  }

  // TC4
  try {
    const { status, json } = await apiGet("/api/purchase-invoices/stats", authCookie);
    const d = json?.data;
    const pass = status === 200 && json?.success === true && d && typeof d.unpaid === "number";
    record(
      "TC4",
      "GET /api/purchase-invoices/stats has unpaid field",
      pass,
      pass ? `unpaid=${d.unpaid}` : `status=${status}, data=${JSON.stringify(d)?.slice(0, 100)}`
    );
  } catch (err) {
    record("TC4", "GET /api/purchase-invoices/stats has unpaid field", false, err.message);
  }

  // TC5
  try {
    const { status, json } = await apiGet("/api/payments/stats", authCookie);
    const d = json?.data;
    const pass = status === 200 && json?.success === true && d && typeof d.totalAmount === "number";
    record(
      "TC5",
      "GET /api/payments/stats has totalAmount",
      pass,
      pass ? `totalAmount=${d.totalAmount}` : `status=${status}, data=${JSON.stringify(d)?.slice(0, 100)}`
    );
  } catch (err) {
    record("TC5", "GET /api/payments/stats has totalAmount", false, err.message);
  }

  // TC6
  try {
    const { status, json } = await apiGet("/api/dashboard/stats", authCookie);
    const d = json?.data;
    const pass =
      status === 200 &&
      json?.success === true &&
      d?.products &&
      typeof d.products.lowStock === "number";
    record(
      "TC6",
      "GET /api/dashboard/stats includes products.lowStock",
      pass,
      pass ? `products.lowStock=${d.products.lowStock}` : `status=${status}, products=${JSON.stringify(d?.products)?.slice(0, 100)}`
    );
  } catch (err) {
    record("TC6", "GET /api/dashboard/stats includes products.lowStock", false, err.message);
  }

  // TC7
  const libFiles = [
    "lib/purchase-service.js",
    "lib/payment-service.js",
    "lib/stock-service.js",
    "lib/receipt-service.js",
  ];
  let tc7Pass = true;
  const tc7Details = [];
  for (const f of libFiles) {
    const { ok, detail } = syntaxCheck(f);
    if (!ok) tc7Pass = false;
    tc7Details.push(`${f}: ${detail}`);
  }
  record("TC7", "Syntax check service lib files", tc7Pass, tc7Details.join("; "));

  console.log("");
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log("=== SUMMARY ===");
  console.log(`Total: ${results.length}  Passed: ${passed}  Failed: ${failed}`);
  if (authNote) console.log(`Auth note: ${authNote}`);
  console.log("Protected routes require NextAuth session cookie (see login flow above).");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
