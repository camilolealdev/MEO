import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
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
} satisfies NextAuthConfig;
