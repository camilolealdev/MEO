import { db } from "./db";
import { users, subscriptions } from "./schema";
import { eq } from "drizzle-orm";

const PAYPAL_API =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export const PAYPAL_TIER_PLANS: Record<
  "pro" | "agency",
  { planId: string; tier: "pro" | "agency" }
> = {
  pro: { planId: process.env.PAYPAL_PLAN_PRO ?? "", tier: "pro" },
  agency: { planId: process.env.PAYPAL_PLAN_AGENCY ?? "", tier: "agency" },
};

async function getPayPalToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials not set");

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Failed to get PayPal token");
  return data.access_token;
}

export async function createPayPalSubscription(
  userId: string,
  userEmail: string,
  tier: "pro" | "agency"
): Promise<string> {
  const token = await getPayPalToken();
  const plan = PAYPAL_TIER_PLANS[tier];

  const res = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      plan_id: plan.planId,
      custom_id: `${userId}:${tier}`,
      subscriber: { email_address: userEmail },
      application_context: {
        brand_name: "MEO",
        locale: "es-CO",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/precios`,
      },
    }),
  });

  const data = (await res.json()) as {
    links?: Array<{ rel: string; href: string }>;
  };
  const approveLink = data.links?.find((l) => l.rel === "approve");
  if (!approveLink) throw new Error("PayPal did not return approve link");
  return approveLink.href;
}

export async function handlePayPalWebhook(subscriptionId: string): Promise<void> {
  const token = await getPayPalToken();

  const res = await fetch(
    `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = (await res.json()) as {
    custom_id?: string;
    status?: string;
    plan_id?: string;
    billing_info?: { next_billing_time?: string };
  };

  const customId: string = data.custom_id ?? "";
  const [userId, tier] = customId.split(":") as [string, "pro" | "agency"];
  const status: string = data.status ?? "INACTIVE";
  const isActive = status === "ACTIVE";

  const nextBillingTime = data.billing_info?.next_billing_time
    ? new Date(data.billing_info.next_billing_time)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.transaction(async (tx) => {
    await tx
      .insert(subscriptions)
      .values({
        id: crypto.randomUUID(),
        userId,
        provider: "paypal",
        stripeSubscriptionId: subscriptionId,
        stripePriceId: data.plan_id ?? tier,
        status,
        tier,
        currentPeriodEnd: nextBillingTime,
      })
      .onConflictDoUpdate({
        target: subscriptions.stripeSubscriptionId,
        set: { status, tier, currentPeriodEnd: nextBillingTime },
      });

    await tx
      .update(users)
      .set({ tier: isActive ? tier : "free" })
      .where(eq(users.id, userId));
  });
}
