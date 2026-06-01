import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Applying migration 0002: add password_hash column...");
  await sql(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;`);
  console.log("Migration applied successfully.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
