import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/", "/curso", "/precios", "/login", "/register"];

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

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
};
