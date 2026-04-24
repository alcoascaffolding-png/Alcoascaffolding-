/**
 * Next.js Middleware — runs on the Edge runtime.
 * Uses only the Edge-compatible auth config (no Node.js APIs, no Mongoose).
 */

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
