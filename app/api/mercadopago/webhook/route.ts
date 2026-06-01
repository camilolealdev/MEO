import { NextRequest, NextResponse } from "next/server";
import { handleMPWebhook } from "@/lib/mercadopago";
import crypto from "crypto";

function verifyMPSignature(req: NextRequest, body: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;
  const xSignature = req.headers.get("x-signature") ?? "";
  const tsMatch = xSignature.match(/ts=(\d+)/);
  const hashMatch = xSignature.match(/v1=([a-f0-9]+)/);
  if (!tsMatch || !hashMatch) return false;
  const ts = tsMatch[1];
  const hash = hashMatch[1];
  const computed = crypto.createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
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
    await handleMPWebhook(parsed.data.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("MercadoPago webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
