import { NextRequest, NextResponse } from "next/server";
import { handleMPWebhook } from "@/lib/mercadopago";
import { isNewWebhookEvent } from "@/lib/webhook-events";
import crypto from "crypto";

function verifyMPSignature(req: NextRequest, body: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    // Fail-closed en producción: sin secreto configurado no se puede verificar
    // la autenticidad, así que se rechaza. En desarrollo se permite para poder
    // probar localmente sin secreto.
    if (process.env.NODE_ENV === "production") {
      console.error("MERCADOPAGO_WEBHOOK_SECRET no está configurado — webhook rechazado");
      return false;
    }
    return true;
  }
  const xSignature = req.headers.get("x-signature") ?? "";
  const tsMatch = xSignature.match(/ts=(\d+)/);
  const hashMatch = xSignature.match(/v1=([a-f0-9]+)/);
  if (!tsMatch || !hashMatch) return false;
  const ts = tsMatch[1];
  const hash = hashMatch[1];
  const computed = crypto.createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
  const computedBuf = Buffer.from(computed);
  const hashBuf = Buffer.from(hash);
  // timingSafeEqual lanza si las longitudes difieren: comparar primero evita un
  // 500 y devuelve un rechazo determinista (401) ante una firma malformada.
  if (computedBuf.length !== hashBuf.length) return false;
  return crypto.timingSafeEqual(computedBuf, hashBuf);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    if (!verifyMPSignature(req, body)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    const parsed = JSON.parse(body);
    if (parsed.type !== "preapproval" || !parsed.data?.id) {
      return NextResponse.json({ received: true });
    }
    // Idempotencia por id de notificación (fallback al id del preapproval).
    const eventId = String(parsed.id ?? parsed.data.id);
    if (!(await isNewWebhookEvent("mercadopago", eventId))) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    await handleMPWebhook(parsed.data.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("MercadoPago webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
