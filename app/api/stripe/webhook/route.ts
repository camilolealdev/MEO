import { NextRequest, NextResponse } from "next/server";
import { stripe, handleSubscriptionUpsert } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/schema";
import { isNewWebhookEvent } from "@/lib/webhook-events";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook: verificación de firma fallida:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotencia: si el evento ya se procesó, confirmar sin reprocesar.
  if (!(await isNewWebhookEvent("stripe", event.id))) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await handleSubscriptionUpsert(sub);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      if (event.type === "customer.subscription.deleted") {
        await db.update(users).set({ tier: "free" }).where(eq(users.stripeCustomerId, sub.customer as string));
        // Mantener sincronizada la fila de suscripción (evita que quede 'active'
        // mientras el usuario ya es 'free').
        await db.update(subscriptions).set({ status: "canceled" }).where(eq(subscriptions.stripeSubscriptionId, sub.id));
      } else {
        await handleSubscriptionUpsert(sub);
      }
      break;
    }
  }
  return NextResponse.json({ received: true });
}
