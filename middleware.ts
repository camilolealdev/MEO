import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

const PUBLIC_PATHS = ["/", "/curso", "/precios", "/login", "/register"];
const LEARN_PATH = /^\/learn/;
const DASHBOARD_PATH = /^\/(dashboard|mi-ruta|progreso)/;
const ADMIN_PATH = /^\/admin/;

export default auth((req: NextAuthRequest) => {
  const { nextUrl } = req;
  const session = req.auth;
  const path = nextUrl.pathname;

  const isPublic = PUBLIC_PATHS.some(p => path === p) || path.startsWith("/api/auth") || path.startsWith("/api/stripe");

  if (isPublic) return NextResponse.next();

  if (!session) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, req.url));
  }

  if (ADMIN_PATH.test(path) && session.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
};
