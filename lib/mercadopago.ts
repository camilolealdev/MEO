import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { db } from "./db";
import { users, subscriptions } from "./schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const MP_TIER_PLANS: Record<
  "pro" | "agency",
  { planId: string; amount: number; name: string }
> = {
  pro: {
    planId: process.env.MERCADOPAGO_PLAN_PRO ?? "",
    amount: 29,
    name: "MEO Practitioner",
  },
  agency: {
    planId: process.env.MERCADOPAGO_PLAN_AGENCY ?? "",
    amount: 79,
    name: "MEO Orchestrator",
  },
};

function getMPClient(): MercadoPagoConfig {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is not set");
  }
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
}

export async function createMPSubscription(
  userId: string,
  userEmail: string,
  tier: "pro" | "agency"
): Promise<string> {
  const client = getMPClient();
  const preApproval = new PreApproval(client);
  const plan = MP_TIER_PLANS[tier];

  const result = await preApproval.create({
    body: {
      preapproval_plan_id: plan.planId,
      reason: plan.name,
      payer_email: userEmail,
      external_reference: `${userId}:${tier}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.amount,
        currency_id: "USD",
      },
      back_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
      status: "pending",
    },
  });

  if (!result.init_point) throw new Error("MercadoPago did not return init_point");
  return result.init_point;
}

export async function handleMPWebhook(preapprovalId: string): Promise<void> {
  const client = getMPClient();
  const preApproval = new PreApproval(client);

  const result = await preApproval.get({ id: preapprovalId });
  if (!result.external_reference) return;

  const [userId, tier] = result.external_reference.split(":") as [
    string,
    "pro" | "agency",
  ];
  const status = result.status;
  const isActive = status === "authorized";

  // Derive the plan ID from the tier config as a fallback since the
  // PreApprovalResponse type does not expose preapproval_plan_id.
  const planId = MP_TIER_PLANS[tier]?.planId ?? tier;

  await db.transaction(async (tx) => {
    await tx
      .insert(subscriptions)
      .values({
        id: nanoid(),
        userId,
        stripeSubscriptionId: preapprovalId,
        stripePriceId: planId,
        status: status ?? "pending",
        tier,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .onConflictDoUpdate({
        target: subscriptions.stripeSubscriptionId,
        set: {
          status: status ?? "pending",
          tier,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

    await tx
      .update(users)
      .set({ tier: isActive ? tier : "free" })
      .where(eq(users.id, userId));
  });
}
