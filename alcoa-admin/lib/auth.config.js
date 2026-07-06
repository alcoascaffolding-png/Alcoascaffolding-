/**
 * Edge-compatible NextAuth configuration.
 * This file must NOT import any Node.js-only modules (mongoose, bcrypt, dns, etc.)
 * It is used by proxy.js (Edge runtime) and merged into lib/auth.js on the server.
 *
 * JWT + session callbacks here MUST stay in sync with lib/auth.js so middleware
 * can decode the session cookie after credentials sign-in.
 */

export const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const authSession = {
  strategy: "jwt",
  maxAge: 7 * 24 * 60 * 60,
};

function applyTokenToSession(session, token) {
  if (!session?.user || !token) return session;
  session.user.id = token.id ?? token.sub ?? session.user.id;
  session.user.name = token.name ?? session.user.name ?? "";
  session.user.email = token.email ?? session.user.email ?? "";
  session.user.role = token.role ?? "viewer";
  session.user.department = token.department ?? "";
  session.user.permissions = Array.isArray(token.permissions) ? token.permissions : [];
  session.user.useCustomPermissions = !!token.useCustomPermissions;
  session.user.avatar = token.avatar ?? null;
  return session;
}

export const authConfig = {
  secret: authSecret,
  trustHost: true,
  session: authSession,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!(auth?.user?.email || auth?.user?.id);

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

    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.role = user.role ?? "viewer";
        token.department = user.department ?? "";
        token.permissions = user.permissions ?? [];
        token.useCustomPermissions = !!user.useCustomPermissions;
        token.avatar = user.avatar ?? null;
      }
      return token;
    },

    session({ session, token }) {
      return applyTokenToSession(session, token);
    },
  },

  // Empty providers array here — providers are defined in lib/auth.js
  providers: [],
};
