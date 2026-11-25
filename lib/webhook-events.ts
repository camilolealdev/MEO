import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { subscriptions, users, webhookEvents, type Subscription } from "./schema";

type Snapshot = Pick<Subscription, "userId" | "stripePriceId" | "status" | "tier" | "currentPeriodEnd">;

export const accessGrantingSubscription = or(
  and(eq(subscriptions.provider, "stripe"), or(
    eq(subscriptions.status, "active"),
    eq(subscriptions.status, "trialing"),
    eq(subscriptions.status, "past_due"),
  )),
  and(eq(subscriptions.provider, "mercadopago"), eq(subscriptions.status, "authorized")),
  and(eq(subscriptions.provider, "paypal"), eq(subscriptions.status, "ACTIVE")),
)!;

function createPaymentDb() {
  neonConfig.webSocketConstructor = WebSocket;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4, connectionTimeoutMillis: 10_000 });
  pool.on("error", (error) => console.error("Billing database connection error", error));
  return drizzle(pool);
}

let paymentDb: ReturnType<typeof createPaymentDb> | undefined;

export async function syncSubscription(
  provider: Subscription["provider"],
  providerId: string,
  eventId: string | undefined,
  load: () => Promise<Snapshot>,
): Promise<boolean> {
  paymentDb ??= createPaymentDb();
  return paymentDb.transaction(async (tx) => {
    let claimedId: string | undefined;
    if (eventId) {
      // A historical row with no completion marker can safely be processed again.
      // Claim and completion share a transaction so a provider retry can finish rolled-back work.
      const claimed = await tx.insert(webhookEvents)
        .values({ provider, eventId })
        .onConflictDoUpdate({
          target: [webhookEvents.provider, webhookEvents.eventId],
          set: { eventId },
          setWhere: isNull(webhookEvents.processedAt),
        })
        .returning({ id: webhookEvents.id });
      if (!claimed.length) return false;
      claimedId = claimed[0].id;
    }

    // Serialize reads of provider state for the same subscription, including cron reads.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${provider}:${providerId}`}, 0))`);
    const snapshot = await load();
    const [owner] = await tx.select({ id: users.id, role: users.role }).from(users)
      .where(eq(users.id, snapshot.userId)).for("update");
    if (!owner) throw new Error("Subscription owner does not exist");

    const { status, tier, currentPeriodEnd, stripePriceId, userId } = snapshot;
    const [saved] = await tx.insert(subscriptions).values({ ...snapshot, provider, stripeSubscriptionId: providerId }).onConflictDoUpdate({
      target: subscriptions.stripeSubscriptionId,
      set: { status, tier, currentPeriodEnd, stripePriceId },
      setWhere: and(eq(subscriptions.provider, provider), eq(subscriptions.userId, userId)),
    }).returning({ id: subscriptions.id });
    if (!saved) throw new Error("Subscription owner or provider has changed");

    if (owner.role !== "admin") {
      const active = await tx.select({ tier: subscriptions.tier }).from(subscriptions)
        .where(and(eq(subscriptions.userId, userId), accessGrantingSubscription));
      const effectiveTier = active.some((sub) => sub.tier === "agency") ? "agency" : active.length ? "pro" : "free";
      await tx.update(users).set({ tier: effectiveTier }).where(eq(users.id, userId));
    }
    if (claimedId) {
      await tx.update(webhookEvents).set({ processedAt: new Date() }).where(eq(webhookEvents.id, claimedId));
    }
    return true;
  });
}
