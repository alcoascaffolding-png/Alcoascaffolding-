/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not set `turbopack.root` to the same directory as this app: it makes
  // `path.relative(root, dir)` become "" → "." and breaks CSS `@import "tailwindcss"`
  // resolution (parent folder, no package.json). See vercel/next.js#90307.

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
