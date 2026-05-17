/**
 * Edge-compatible NextAuth configuration.
 * This file must NOT import any Node.js-only modules (mongoose, bcrypt, dns, etc.)
 * It is used by middleware.js which runs on the Edge runtime.
 *
 * The full auth config (with the Credentials provider and DB access) lives in lib/auth.js
 * and is only imported by API route handlers that run on the Node.js runtime.
 */

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      // Public paths — always allow
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/email") ||
        pathname.startsWith("/api/setup") ||
        pathname.startsWith("/api/health")
      ) {
        // If logged in user visits /login, redirect to dashboard
        if (isLoggedIn && pathname.startsWith("/login")) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
        return true;
      }

      // Everything else requires authentication
      return isLoggedIn;
    },
  },

  // Empty providers array here — providers are defined in lib/auth.js
  providers: [],
};
