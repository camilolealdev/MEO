-- Add unique constraint on (user_id, framework_slug) to prevent duplicate progress entries

CREATE UNIQUE INDEX IF NOT EXISTS "progress_user_slug_idx" ON "progress" ("user_id", "framework_slug");
