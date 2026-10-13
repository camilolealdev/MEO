import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { rateLimit } from "@/lib/rate-limit";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-reset";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    if (!rateLimit(`change-pw:${userId}`, 5, 10 * 60 * 1000).ok) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }
    const { currentPassword, newPassword } = await req.json();
    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` },
        { status: 400 }
      );
    }
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

    // Si ya tiene contraseña, hay que confirmar la actual; cuentas de Google/magic link pueden crear una.
    if (user.passwordHash) {
      const ok = typeof currentPassword === "string" && (await bcrypt.compare(currentPassword, user.passwordHash));
      if (!ok) return NextResponse.json({ error: "La contraseña actual no es correcta." }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
