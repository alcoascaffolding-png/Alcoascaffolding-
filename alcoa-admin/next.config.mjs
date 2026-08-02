import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * PDF header/footer art, fonts, and logo are read from disk at render time, so every
 * route that generates a PDF needs them traced into its serverless bundle.
 */
const PDF_TRACED_FILES = [
  "./assets/**",
  "./assets/fonts/**",
  "./public/brand/**",
  "./lib/pdf/**",
  "./lib/map-sales-order-for-quotation-pdf.js",
];

const PDF_ROUTE_GLOBS = [
  "/api/quotations/**",
  "/api/sales-orders/**",
  "/api/sales-invoices/**",
  "/api/delivery-notes/**",
  "/api/purchase-orders/**",
  "/api/purchase-invoices/**",
  "/api/letterhead/**",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo / Vercel: trace files from repo root so serverless output includes deps correctly.
  outputFileTracingRoot: path.join(__dirname, ".."),

  outputFileTracingIncludes: Object.fromEntries(
    PDF_ROUTE_GLOBS.map((route) => [route, PDF_TRACED_FILES])
  ),

  // External packages that should not be bundled for server components
  // Needed for mongoose, playwright-core, twilio, etc.
  serverExternalPackages: [
    "mongoose",
    "playwright-core",
    "@sparticuz/chromium-min",
    "twilio",
    "bcryptjs",
    "exceljs",
  ],

  // Allow images from any hostname
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/api/email/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
