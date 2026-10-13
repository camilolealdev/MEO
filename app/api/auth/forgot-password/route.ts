import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createResetToken, sendResetEmail } from "@/lib/password-reset";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OK = { success: true };

export async function POST(req: Request) {
  try {
    if (!rateLimit(`forgot-ip:${getClientIp(req)}`, 5, 10 * 60 * 1000).ok) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }
    const { email } = await req.json();
    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();
    if (!rateLimit(`forgot-email:${normalized}`, 3, 60 * 60 * 1000).ok) return NextResponse.json(OK);

    const user = await db.query.users.findFirst({ where: eq(users.email, normalized) });
    if (user) {
      const token = await createResetToken(normalized);
      await sendResetEmail(normalized, token);
    }
    // Misma respuesta exista o no el email, para no revelar cuentas.
    return NextResponse.json(OK);
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
