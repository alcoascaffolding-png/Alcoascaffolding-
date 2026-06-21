/**
 * Full NextAuth configuration — Node.js runtime only.
 * This file imports mongoose models and DB utilities.
 * DO NOT import this from middleware.js (Edge runtime).
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { connectDB } from "./db";

/** Plain string[] — Mongoose arrays are not structuredClone-safe in Auth.js JWT encoding */
function plainPermissionList(value) {
  if (value == null) return [];
  return Array.from(value, (p) => String(p));
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In NextAuth v5, returning null → client gets "CredentialsSignin" error.
        // Throwing any error → client gets generic "Configuration" error. Always return null.
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailKey = String(credentials.email).toLowerCase().trim();
        const { checkLoginRateLimit } = await import("./rate-limit");
        const loginRl = checkLoginRateLimit(emailKey);
        if (!loginRl.success) {
          return null;
        }

        try {
          await connectDB();

          // Dynamic import so Mongoose is never pulled into the Edge bundle
          const { default: User } = await import("@/models/User");

          const user = await User.findOne({
            email: String(credentials.email).toLowerCase().trim(),
          }).select("+password");

          if (!user || !user.isActive) {
            return null;
          }

          const isValid = await user.comparePassword(String(credentials.password));
          if (!isValid) {
            return null;
          }

          // Fire-and-forget last login update
          User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch(() => {});

          return {
            id: user._id.toString(),
            name: String(user.name ?? ""),
            email: String(user.email ?? ""),
            role: String(user.role ?? "viewer"),
            department: user.department != null ? String(user.department) : "",
            avatar: user.avatar != null ? String(user.avatar) : null,
            permissions: plainPermissionList(user.permissions),
          };
        } catch (err) {
          console.error("[auth] authorize error:", err.message);
          // Credentials errors should return null. Infrastructure failures (DB/network)
          // should throw so the client can surface a non-credentials error state.
          if (
            err?.name === "MongooseServerSelectionError" ||
            err?.name === "MongoNetworkError" ||
            err?.name === "MongoServerSelectionError" ||
            /Could not connect to any servers/i.test(String(err?.message ?? ""))
          ) {
            throw new Error("DatabaseUnavailable");
          }
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.permissions = plainPermissionList(user.permissions);
        token.avatar = user.avatar ?? null;
        return token;
      }

      if (token?.id) {
        try {
          await connectDB();
          const { default: User } = await import("@/models/User");
          const dbUser = await User.findById(token.id).select(
            "passwordChangedAt isActive role department permissions avatar"
          );
          if (!dbUser?.isActive) return null;
          if (dbUser.changedPasswordAfter(token.iat)) return null;
          token.role = String(dbUser.role ?? "viewer");
          token.department = dbUser.department != null ? String(dbUser.department) : "";
          token.permissions = plainPermissionList(dbUser.permissions);
          token.avatar = dbUser.avatar ?? null;
        } catch (err) {
          console.error("[auth] jwt refresh error:", err.message);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.department = token.department;
        session.user.permissions = token.permissions;
        session.user.avatar = token.avatar;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
