/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // CORS headers for public email API endpoints (used by the marketing site)
  async headers() {
    return [
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
