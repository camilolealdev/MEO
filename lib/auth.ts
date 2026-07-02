import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens } from "./schema";
import { eq } from "drizzle-orm";
import { authConfig } from "../auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
    ...(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_xxx")
      ? [Resend({ apiKey: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM ?? "noreply@meo-platform.com" })]
      : []),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users as any,
    accountsTable: accounts as any,
    sessionsTable: sessions as any,
    verificationTokensTable: verificationTokens as any,
  }),
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) token.id = user.id!;
      // Refresco periódico de tier/rol: además del primer login y de update(),
      // se revalida contra la BD si pasaron más de REFRESH_MS. Así un cambio de
      // tier (pago) o una revocación (cancelación / baja de rol) se propaga en
      // minutos, no cuando expire el JWT (~30 días), sin consultar la BD por request.
      const REFRESH_MS = 5 * 60 * 1000;
      const now = Date.now();
      const lastRefresh = token.refreshedAt ?? 0;
      if (user || trigger === "update" || now - lastRefresh > REFRESH_MS) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.id!),
        });
        token.tier = dbUser?.tier ?? "free";
        token.role = dbUser?.role ?? "user";
        token.refreshedAt = now;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.tier = token.tier ?? "free";
        session.user.role = token.role ?? "user";
      }
      return session;
    },
  },
});
