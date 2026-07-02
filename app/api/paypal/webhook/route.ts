import { NextRequest, NextResponse } from "next/server";
import { handlePayPalWebhook } from "@/lib/paypal";

const PAYPAL_API =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const DEACTIVATE_EVENTS = new Set([
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED",
]);

const RELEVANT_EVENTS = new Set([
  "BILLING.SUBSCRIPTION.ACTIVATED",
  ...DEACTIVATE_EVENTS,
]);

async function verifyPayPalSignature(req: NextRequest, body: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // Fail-closed en producción (ver webhook de MercadoPago para el razonamiento).
    if (process.env.NODE_ENV === "production") {
      console.error("PAYPAL_WEBHOOK_ID no está configurado — webhook rechazado");
      return false;
    }
    return true;
  }

  const authAlgo = req.headers.get("paypal-auth-algo") ?? "";
  const certUrl = req.headers.get("paypal-cert-url") ?? "";
  const transmissionId = req.headers.get("paypal-transmission-id") ?? "";
  const transmissionSig = req.headers.get("paypal-transmission-sig") ?? "";
  const transmissionTime = req.headers.get("paypal-transmission-time") ?? "";

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return false;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) return false;

  const verifyRes = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  });

  const verifyData = (await verifyRes.json()) as { verification_status?: string };
  return verifyData.verification_status === "SUCCESS";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const isValid = await verifyPayPalSignature(req, body);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const parsed = JSON.parse(body) as {
      event_type?: string;
      resource?: { id?: string };
    };

    const eventType: string = parsed.event_type ?? "";
    const subscriptionId: string = parsed.resource?.id ?? "";

    if (!subscriptionId) {
      return NextResponse.json({ received: true });
    }

    if (!RELEVANT_EVENTS.has(eventType)) {
      return NextResponse.json({ received: true });
    }

    await handlePayPalWebhook(subscriptionId);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
