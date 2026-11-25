import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const databaseUrl = process.env.BILLING_TEST_DATABASE_URL;

// CI swaps only the connection transport. The production Drizzle queries and
// PostgreSQL transaction, locks, and uniqueness constraints all run unchanged.
const connections = vi.hoisted(() => ({
  pools: [] as Array<{ end: () => Promise<void> }>,
}));

vi.mock("@neondatabase/serverless", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@neondatabase/serverless")>();
  const { Pool } = createRequire(import.meta.url)("pg") as Pick<typeof actual, "Pool">;
  return {
    ...actual,
    Pool: class TestPool extends Pool {
      constructor(options: ConstructorParameters<typeof Pool>[0]) {
        super(options);
        connections.pools.push(this);
      }
    },
  };
});

describe.skipIf(!databaseUrl)("subscription storage with PostgreSQL", () => {
  const userId = crypto.randomUUID();
  const suffix = crypto.randomUUID();
  let sql: import("@neondatabase/serverless").Pool;
  let syncSubscription: typeof import("@/lib/webhook-events").syncSubscription;

  beforeAll(async () => {
    vi.stubEnv("DATABASE_URL", databaseUrl);
    const { Pool } = await import("@neondatabase/serverless");
    sql = new Pool({ connectionString: databaseUrl });
    await sql.query("insert into users (id, email) values ($1, $2)", [userId, `${userId}@example.org`]);
    ({ syncSubscription } = await import("@/lib/webhook-events"));
  });

  afterAll(async () => {
    if (sql) {
      await sql.query("delete from users where id = $1", [userId]);
      await sql.query("delete from webhook_events where event_id = any($1)", [[`retry-${suffix}`, `legacy-${suffix}`]]);
    }
    await Promise.all(connections.pools.map((pool) => pool.end()));
    vi.unstubAllEnvs();
  });

  it("allows retries after rollback and skips completed deliveries", async () => {
    const providerId = `stripe-${suffix}`;
    const event = `retry-${suffix}`;
    const valid = { userId, stripePriceId: "plan-pro", status: "active", tier: "pro" as const, currentPeriodEnd: null };

    await expect(syncSubscription("stripe", providerId, event, async () => ({
      ...valid, userId: "unknown-test-user",
    }))).rejects.toThrow("Subscription owner does not exist");
    await expect(syncSubscription("stripe", providerId, event, async () => valid)).resolves.toBe(true);
    const duplicate = vi.fn(async () => valid);
    await expect(syncSubscription("stripe", providerId, event, duplicate)).resolves.toBe(false);
    expect(duplicate).not.toHaveBeenCalled();
    const { rows } = await sql.query<{ processed_at: Date }>(
      "select processed_at from webhook_events where provider = 'stripe' and event_id = $1",
      [event],
    );
    expect(rows[0].processed_at).toBeInstanceOf(Date);
  });

  it("adopts legacy events and preserves access from another provider", async () => {
    await sql.query("delete from subscriptions where user_id = $1", [userId]);
    const event = `legacy-${suffix}`;
    await sql.query("insert into webhook_events (id, provider, event_id) values ($1, 'mercadopago', $2)", [event, event]);

    const base = { userId, stripePriceId: "plan-agency", tier: "agency" as const, currentPeriodEnd: null };
    await expect(syncSubscription("mercadopago", `mp-${suffix}`, event, async () => ({
      ...base, status: "authorized",
    }))).resolves.toBe(true);
    await syncSubscription("paypal", `pp-${suffix}`, undefined, async () => ({ ...base, tier: "pro", status: "ACTIVE" }));
    await syncSubscription("mercadopago", `mp-${suffix}`, undefined, async () => ({ ...base, status: "cancelled" }));

    const { rows } = await sql.query<{ tier: string }>("select tier from users where id = $1", [userId]);
    expect(rows[0].tier).toBe("pro");
  });
});
