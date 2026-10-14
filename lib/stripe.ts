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
    const client = getStripe() as unknown as Record<PropertyKey, unknown>;
    return client[prop];
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

// Estados en los que se conserva el acceso de pago. `past_due` se mantiene para
// respetar el ciclo de dunning de Stripe (reintentos de cobro) en lugar de
// degradar al instante; `trialing` cubre pruebas gratuitas.
const KEEP_ACCESS_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
  "past_due",
]);

export async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0].price.id;
  const tier = TIER_PRICES[priceId];
  // Sin default a "pro": un price desconocido no debe conceder acceso de pago.
  if (!tier) {
    console.error(`handleSubscriptionUpsert: priceId desconocido "${priceId}" (sub ${subscription.id})`);
    return;
  }

  // El metadata.userId solo está garantizado en la Checkout Session inicial;
  // en eventos updated/deleted suele venir vacío. Fallback: resolver por el
  // stripeCustomerId almacenado en users.
  let userId: string | undefined = subscription.metadata?.userId;
  if (!userId) {
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;
    if (customerId) {
      const owner = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId),
      });
      userId = owner?.id;
    }
  }
  if (!userId) {
    console.error(`handleSubscriptionUpsert: no se pudo resolver el usuario (sub ${subscription.id})`);
    return;
  }
  // const para que TS conserve el estrechamiento a string dentro del closure.
  const resolvedUserId = userId;

  const keepAccess = KEEP_ACCESS_STATUSES.has(subscription.status);

  await db.transaction(async (tx) => {
    await tx.insert(subscriptions)
      .values({
        id: subscription.id,
        userId: resolvedUserId,
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
      .set({ tier: keepAccess ? tier : "free" })
      .where(eq(users.id, resolvedUserId));
  });
}
