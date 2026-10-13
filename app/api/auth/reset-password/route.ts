import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { consumeResetToken, MIN_PASSWORD_LENGTH } from "@/lib/password-reset";

export async function POST(req: Request) {
  try {
    if (!rateLimit(`reset-ip:${getClientIp(req)}`, 10, 10 * 60 * 1000).ok) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }
    const { email, token, password } = await req.json();
    if (typeof email !== "string" || typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` },
        { status: 400 }
      );
    }
    const normalized = email.trim().toLowerCase();
    if (!(await consumeResetToken(normalized, token))) {
      return NextResponse.json({ error: "El enlace es inválido o venció." }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await db.update(users).set({ passwordHash }).where(eq(users.email, normalized));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
