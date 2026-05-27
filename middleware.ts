import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/", "/curso", "/precios", "/login", "/register"];
const ADMIN_PATH = /^\/admin/;

export default auth((req: NextAuthRequest) => {
  const { nextUrl } = req;
  const session = req.auth;
  const path = nextUrl.pathname;

  const isPublic =
    PUBLIC_PATHS.some((p) => path === p) ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/stripe") ||
    path.startsWith("/api/mercadopago") ||
    path.startsWith("/api/paypal");

  if (isPublic) return NextResponse.next();

  if (!session) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, req.url)
    );
  }

  // Defense-in-depth: admin role stored in JWT at sign-in via lib/auth.ts jwt callback
  if (ADMIN_PATH.test(path) && (session.user as any)?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
};
