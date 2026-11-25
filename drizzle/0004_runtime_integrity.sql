ALTER TABLE "webhook_events" ADD COLUMN IF NOT EXISTS "processed_at" timestamp;
--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "current_period_end" DROP NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "diagnostic_routes" (
  "user_id" text PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "framework_slugs" jsonb NOT NULL,
  "answers" jsonb NOT NULL
);
