import Stripe from "stripe";
import { db } from "./db";
import { users, subscriptions } from "./schema";
import { eq } from "drizzle-orm";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

export const TIER_PRICES: Record<string, "pro" | "agency"> = {
  [process.env.STRIPE_PRICE_PRO!]: "pro",
  [process.env.STRIPE_PRICE_AGENCY!]: "agency",
};

export async function createCheckoutSession(userId: string, priceId: string, userEmail: string) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  let customerId = existingUser?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({ email: userEmail });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/precios`,
    metadata: { userId },
  });
}

export async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0].price.id;
  const tier = TIER_PRICES[priceId] ?? "pro";
  const userId = subscription.metadata.userId;
  if (!userId) return;

  await db.transaction(async (tx) => {
    await tx.insert(subscriptions)
      .values({
        id: subscription.id,
        userId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        status: subscription.status,
        tier,
        currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
      })
      .onConflictDoUpdate({
        target: subscriptions.stripeSubscriptionId,
        set: {
          status: subscription.status,
          tier,
          currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
        },
      });

    await tx.update(users)
      .set({ tier: subscription.status === "active" ? tier : "free" })
      .where(eq(users.id, userId));
  });
}
