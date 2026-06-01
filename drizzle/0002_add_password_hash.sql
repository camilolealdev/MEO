-- Add password_hash column for credentials provider
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;
