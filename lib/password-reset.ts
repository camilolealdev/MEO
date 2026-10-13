import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { verificationTokens } from "@/lib/schema";

export const MIN_PASSWORD_LENGTH = 8;
const TOKEN_TTL_MS = 60 * 60 * 1000;

const identifierFor = (email: string) => `pwreset:${email.toLowerCase()}`;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createResetToken(email: string): Promise<string> {
  const identifier = identifierFor(email);
  const token = randomBytes(32).toString("hex");
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({
    identifier,
    token: hashToken(token),
    expires: new Date(Date.now() + TOKEN_TTL_MS),
  });
  return token;
}

export async function consumeResetToken(email: string, token: string): Promise<boolean> {
  const identifier = identifierFor(email);
  const row = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.identifier, identifier),
      eq(verificationTokens.token, hashToken(token))
    ),
  });
  if (!row) return false;
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  return row.expires.getTime() > Date.now();
}

export async function sendResetEmail(email: string, token: string): Promise<void> {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const link = `${base}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "noreply@meo-platform.com",
        to: email,
        subject: "Restablece tu contraseña de MEO",
        html: `<p>Recibimos una solicitud para restablecer tu contraseña.</p><p><a href="${link}">Crear nueva contraseña</a></p><p>El enlace vence en 1 hora. Si no fuiste tú, ignora este correo.</p>`,
      }),
    });
    if (res.ok) return;
    console.error("Reset email failed:", res.status);
  }
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[dev] Enlace de restablecimiento para ${email}: ${link}`);
  }
}
