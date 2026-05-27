import { NextRequest, NextResponse } from "next/server";
import { handlePayPalWebhook } from "@/lib/paypal";

const DEACTIVATE_EVENTS = new Set([
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED",
]);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      event_type?: string;
      resource?: { id?: string };
    };

    const eventType: string = body.event_type ?? "";
    const subscriptionId: string = body.resource?.id ?? "";

    if (!subscriptionId) {
      return NextResponse.json({ received: true });
    }

    const relevantEvents = new Set([
      "BILLING.SUBSCRIPTION.ACTIVATED",
      ...DEACTIVATE_EVENTS,
    ]);

    if (!relevantEvents.has(eventType)) {
      return NextResponse.json({ received: true });
    }

    await handlePayPalWebhook(subscriptionId);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
