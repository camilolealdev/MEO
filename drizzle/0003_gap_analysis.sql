-- Gap analysis P1: idempotencia de webhooks, provider, updatedAt, índices en FKs,
-- unique en path_enrollments. Todas las operaciones son ADITIVAS y no destructivas.

-- updatedAt
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT now();
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT now();

-- provider en subscriptions (default 'stripe' para filas existentes)
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "provider" text NOT NULL DEFAULT 'stripe';

-- índices en claves foráneas
CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts" ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions" ("user_id");

-- unique en inscripciones a rutas (evita duplicados por usuario+ruta)
CREATE UNIQUE INDEX IF NOT EXISTS "path_enrollments_user_path_idx" ON "path_enrollments" ("user_id", "path_slug");

-- tabla de idempotencia de webhooks
CREATE TABLE IF NOT EXISTS "webhook_events" (
  "id" text PRIMARY KEY NOT NULL,
  "provider" text NOT NULL,
  "event_id" text NOT NULL,
  "received_at" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "webhook_events_provider_event_idx" ON "webhook_events" ("provider", "event_id");
